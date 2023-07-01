import { getHandlers } from './handlers';
import {
  ComponentEffect,
  ComponentEffects,
  ComponentInternalProps,
  ComponentProps,
  ExternalComponentEffects,
  VDOMComponent,
} from './model';
import { getStateClass } from './state';
import { emptySymbol } from '../utils/diff';
import { componentSymbol } from './symbols';
import { patchDOM } from './patchDOM';
import { VDOMLightComponent, VDOMLightNode, diffVdomLight, prepareTempateTree, VDOMRefDom } from '../model';
import { createLightElement } from '../light/element';
import { findParentComponent } from './findParentComponent';

function runEffects(effects: ComponentEffect[]): void {
  for (const effect of effects) effect();
}

export type CreateComponentParams<P extends ComponentProps> = {
  light: VDOMLightComponent<P>;
};

export const createComponent = <P extends ComponentProps>(
  { light }: CreateComponentParams<P>
) => {
  const {
    name: componentName = 'Anonimous',
    get: makeComponent,
    template: { children: initialChildren, props: initialProps },
  } = light;


  let component: VDOMComponent = {} as any;

  // уникальный идентификатор для созданного компонента
  const componentNameSymbol = Symbol(componentName);

  // свойства компонента
  let props: ComponentInternalProps<P> = {
    ...initialProps,
    children: prepareTempateTree(initialChildren),
  };

  // привязка к dom
  const domData: VDOMRefDom['dom'] = {
    ref: undefined,
    parent: undefined,
  };

  // текущая разметка
  let lightVdom: VDOMLightNode;

  // вызванные обработчики
  const handlers = getHandlers();

  const hookCallbacks = {
    mount: [] as ComponentEffect[],
    destroy: [] as ComponentEffect[],
  };

  const effectMap: Map<any, ComponentEffect[]> = new Map();

  const runHook = (name: 'mount' | 'destroy', max = Infinity) => {
    return () => {
      if (handlers[name].count > max) {
        console.error(`${name} hook executed already`);
        return;
      }

      // console.log('createComponent', { hookCallbacks });

      runEffects(hookCallbacks[name]);
      handlers[name].bump();
    };
  };

  const effects: ComponentEffects = {
    mount: runHook('mount', 1),
    destroy: runHook('destroy', 1),
    // cleanup ???
  };

  const externalEffects: ExternalComponentEffects = {
    append: (el) => {
      domData.ref = el;
      let parent = el.parentNode;
      if (parent) {
        domData.parent = parent;
        const { component: parentComponent } =
          findParentComponent(parent) ?? {};
        if (parentComponent) parentComponent.childComponents.push(component);
      }
    },
    updateLight: (light) => {
      lightVdom = light;
    },
    bindElement: (vdomEl) => {
      vdomEl.component = component;
    },
  };

  // console.log('createComponent', makeComponent.toString());

  const render = makeComponent({
    props: () => props,
    state: getStateClass(rerender, fn => effectMap.get(fn) ?? []),
    hooks: {
      mount: (callback) => hookCallbacks.mount.push(callback),
      destroy: (callback) => hookCallbacks.destroy.push(callback),
      effect: (callback, deps = []) => {
        for (const item of deps) {
          if (!effectMap.has(item)) effectMap.set(item, []);
          effectMap.get(item)?.push(callback);
        }
      },
    },
  });

  function rerender() {
    if (!domData.ref) return;

    const template = render();
    const light = createLightElement(template);
    if (!light.props) light.props = {};
    light.props['data-name'] = componentName;

    const lightDiff = diffVdomLight(lightVdom, light);

    // console.log('component/rerender', { lightDiff, lightVdom, light });
    // console.log(printComponentTree(component));
    // printDiff(lightDiff);
    if (lightDiff === emptySymbol) return;

    // обновляем, если были изменения
    lightVdom = light;

    patchDOM(domData.ref, lightDiff);
  }

  const applyDiff: VDOMComponent['applyDiff'] = (componentDiff) => {
    // достаточно raw объекта light, так как потом компонент сам вычислит diff
    const {
      template,
      children: checkChildren,
      props: checkProps,
    } = componentDiff;
    const { children: newChildren, props: newPropsValue } = template;
    const isEmptyChildren = checkChildren === emptySymbol;
    const isEmptyProps = checkProps === emptySymbol;
    if (isEmptyChildren) {
      // поменялись только свойства
      props = { ...(newPropsValue as any), children: props.children };
    } else if (isEmptyProps) {
      // поменялись только дети
      props.children = prepareTempateTree(newChildren);
    } else {
      props = {
        ...(newPropsValue as any),
        children: prepareTempateTree(newChildren),
      };
    }
    rerender();
  };

  Object.assign(component, {
    render,
    name: componentName,
    nameSymbol: componentNameSymbol,
    instance: '0',
    [componentSymbol]: true,
    dom: domData,
    props,
    applyDiff,
    effects,
    externalEffects,
    childComponents: [],
  });

  return component;
};