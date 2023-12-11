import { getHandlers } from './handlers';
import {
  ComponentEffect,
  ComponentEffects,
  ComponentInternalProps,
  ComponentParams,
  ComponentProps,
  ExternalComponentEffects,
  VDOMComponent,
} from './model';
import { StateClass, getStateClass } from './state';
import { emptySymbol, printDiff } from '../utils/diff';
import { componentSymbol } from './symbols';
import { patchDOM } from './patchDOM';
import {
  VDOMLightComponent,
  VDOMLightNode,
  diffVdomLight,
  prepareTempateTree,
  VDOMRefDom,
} from '../model';
import { createLightElement } from '../light/element';
import { findParentComponent } from './findParentComponent';
import { addElementParent } from './addElementParent';
import { DEBUG_MODE } from './debug';
import { printComponentTree } from './printComponentTree';
import { runEffects } from './effects';
import { getNewProps, runPropsEffects } from './applyDiff';

export type CreateComponentParams<P extends ComponentProps> = {
  light: VDOMLightComponent<P>;
};

export const createComponent = <P extends ComponentProps>({
  light,
}: CreateComponentParams<P>) => {
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
        if (parentComponent && !parentComponent.childComponents.has(component))
          parentComponent.childComponents.add(component);
      }
    },
    updateLight: (light) => {
      lightVdom = light;
    },
    bindElement: (vdomEl) => {
      vdomEl.component = component;
    },
  };

  const stateList: StateClass<any>[] = [];

  const stateClass = getStateClass(
    rerender,
    (fn) => effectMap.get(fn) ?? [],
    (v) => stateList.push(v)
  );

  const propsUpdateMap: Map<string, () => any> = new Map();
  const internalProps = new Proxy(
    (() => props) as ComponentParams<P>['props'],
    {
      get(target, key: string) {
        if (propsUpdateMap.has(key)) return propsUpdateMap.get(key);
        const getter = () => props[key as any];
        propsUpdateMap.set(key, getter);
        return getter;
      },
    }
  );

  const rawRender = makeComponent({
    props: internalProps,
    state: stateClass,
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

  const render = () => {
    const element = addElementParent(rawRender(props));
    element.props['data-component'] = componentName;
    return element;
  };

  function rerender() {
    if (!domData.ref) return;

    const template = render();
    const light = createLightElement(template);
    if (!light.props) light.props = {};

    const lightDiff = diffVdomLight(lightVdom, light);

    if (DEBUG_MODE.enabled && props._debug) {
      console.log({template, light, lightVdom, lightDiff});
      console.log(printComponentTree(component));
      console.log(stateList.map((v) => v[0]()));
      console.groupCollapsed(componentName);
      printDiff(lightDiff);
      console.groupEnd();
    }
    if (lightDiff === emptySymbol) return;

    // обновляем, если были изменения
    lightVdom = light;

    patchDOM(domData.ref, lightDiff);
  }

  const applyDiff: VDOMComponent['applyDiff'] = (componentDiff) => {
    // достаточно raw объекта light, так как потом компонент сам вычислит diff
    const newProps: ComponentInternalProps<P> = getNewProps(
      componentDiff,
      props
    );

    const oldProps = props;
    props = newProps;

    rerender();

    runPropsEffects(oldProps, props, (name) => {
      const propUpdateGetter = propsUpdateMap.get(name);
      return propUpdateGetter ? effectMap.get(propUpdateGetter) ?? null : null;
    });
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
    childComponents: new Set(),
  });

  return component;
};
