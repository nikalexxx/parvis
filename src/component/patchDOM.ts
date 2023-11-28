import { DOMFromVdom, isElement, RenderEffect } from '../dom';
import { elementSymbol } from '../symbols';
import {
  arraySymbol,
  deleteSymbol,
  Diff,
  diff,
  DiffByKeys,
  emptySymbol,
  rawSymbol,
} from '../utils/diff';
import { isObject, isPrimitive, setType } from '../utils/type-helpers';
import { getContentFromLight } from '../materialize/materializeVDOMLight';
import { groupLightProps, setAttribute } from '../element';
import { runDestroy } from './runDestroy';
import {
  runDomAction,
  VDOMLightElement,
  VDOMLightProps,
  VDOMLightNode,
  DiffVDOMLight,
  VDOMElementEventListeners,
  VDOMElementAttributes,
  isVDOMElement,
} from '../model';

/** Точечное изменение dom по diff */
export function patchDOM(dom: Node, diffObject: DiffVDOMLight) {
  const parent = dom.parentNode;
  if (!parent) return;

  // console.log('patchDom', { dom, diffObject });

  if (diffObject === emptySymbol) return;

  if (diffObject === deleteSymbol) {
    // слабые ссылки могли бы помочь

    // console.log('patchDOM/delete', { diffObject, dom });

    // стираем информацию о vdom
    delete dom[elementSymbol];

    // удаляем узел
    parent.removeChild(dom);

    return;
  }

  if (isPrimitive(diffObject)) {
    const text = String(diffObject);
    // TODO: добавить другие типы
    if (dom.nodeType === Node.TEXT_NODE) {
      // обновляем текст в текстовом узле
      if (dom.nodeValue !== text) dom.nodeValue = text;
      return;
    }

    // заменяем содержимое на текстовую ноду
    if (isElement(dom)) {
      parent.replaceChild(document.createTextNode(text), dom);
    }
    return;
  }

  if (rawSymbol in diffObject) {
    const light = diffObject as VDOMLightNode;

    const content = getContentFromLight(light);
    const effects: RenderEffect[] = [];

    const newDom = DOMFromVdom(content, effects);

    parent.replaceChild(newDom, dom);

    if (isVDOMElement(light)) {
      light.dom.ref = newDom;
      light.dom.parent = parent;
    }

    // запуск эффектов только после обновления в dom
    effects.forEach((effect) => effect());

    return;
  }

  if (arraySymbol in diffObject) return;

  // далее честный diff

  if ('get' in diffObject) {
    // изменение компонента
    const { component } = dom[elementSymbol] ?? {};
    // console.log('patchDom/component', { component, diffObject });
    if (!component) return; // ошибка

    // компонент сам разбирается с обновлением
    component.applyDiff(diffObject as any);

    return;
  }

  if (!isElement(dom)) return;

  // далее diff по элементам
  setType<DiffByKeys<VDOMLightElement, VDOMLightElement>>(diffObject);

  const props = diffObject.props as Diff<VDOMLightProps, VDOMLightProps>;
  const { attributes, eventListeners } = groupLightProps(
    props as VDOMLightProps
  );

  // console.log('patchDom/element', { attributes, eventListeners });

  if (Object.keys(attributes).length > 0) {
    patchAttributes({ dom, diffAttributes: attributes });
  }

  if (Object.keys(eventListeners).length > 0) {
    patchEventListeners({ dom, diffEventListeners: eventListeners });
  }

  patchChildNodes({
    dom,
    diffChildren: diffObject.children as Diff<VDOMLightNode[]>,
  });
  if (dom.tagName === 'TEXTAREA') {
    runDomAction(dom, 'value', dom.innerHTML);
  }
}

type PatchPropsParams = {
  dom: Element;
  diffAttributes: Diff<VDOMElementAttributes, VDOMElementAttributes>;
};

export function patchAttributes({
  dom,
  diffAttributes,
}: PatchPropsParams): void {
  // пропускаем пустоту
  if (!isObject(diffAttributes)) return;
  const element = dom[elementSymbol];

  for (const name in diffAttributes) {
    // console.log('patchDom/patchAttributes', {name})
    const diffAttribute = diffAttributes[name];

    if (diffAttribute === emptySymbol) continue;

    if (diffAttribute === deleteSymbol) {
      if (element) delete element.attributes[name];
      dom.removeAttribute(name);
      runDomAction(dom, name, false);
      continue;
    }

    if (!isPrimitive(diffAttribute)) continue;

    if (element) element.attributes[name] = diffAttribute;
    setAttribute(dom, name, diffAttribute);
  }
}

type PatchEventListenersParams = {
  dom: Element;
  diffEventListeners: DiffByKeys<
    VDOMElementEventListeners,
    VDOMElementEventListeners
  >;
};

export function patchEventListeners({
  dom,
  diffEventListeners,
}: PatchEventListenersParams): void {
  // console.log('patchDom/patchEventListeners', { diffEventListeners });

  // удаление старых перехватчиков событий
  const oldListeners = dom[elementSymbol]?.eventListeners ?? {};

  // обновление перехватчиков событий
  for (const eventName of Object.keys(diffEventListeners)) {
    const listener = diffEventListeners[eventName];

    if (listener === emptySymbol) continue;

    if (listener === deleteSymbol && oldListeners[eventName]) {
      dom.removeEventListener(eventName, oldListeners[eventName]);
      delete oldListeners[eventName];
      continue;
    }

    if (typeof listener !== 'function') continue;

    oldListeners[eventName] = listener;
    dom.addEventListener(eventName, listener, false);
  }
}

type PatchChildNodesParams = {
  dom: Element;
  diffChildren: Diff<VDOMLightNode[]>;
};

export function patchChildNodes({ dom, diffChildren }: PatchChildNodesParams) {
  if (diffChildren === emptySymbol) return;
  if (diffChildren === deleteSymbol) {
    dom.innerHTML = '';
    return;
  }

  if (typeof diffChildren !== 'object') return;
  if (!(diff.symbols.array in diffChildren)) return;
  // обновление существующих потомков
  // console.log('patchDom/patchChildNodes', { diffChildren });

  const element = dom[elementSymbol];
  if (!element) return;

  const oldNodes = dom.childNodes;
  const { childOrder, children } = element;

  // ключи, которые были обновлены
  const updatedChildKeys = new Set<string>();

  // console.log({childOrder, oldNodes});

  const deletionList: Node[] = [];
  for (let i = 0; i < oldNodes.length; i++) {
    const oldChild = oldNodes[i];
    const key = childOrder[i]; // TODO: поддержать логику с key
    const strI = `${i}`;
    // console.log('patchDom/patchChildNodes/index', {strI})

    if (strI in diffChildren) {
      const childDiff = diffChildren[strI as any];
      if (childDiff === deleteSymbol) {
        // собираем узлы на удаление, чтобы не нарушать порядок
        deletionList.push(oldChild);
      } else {
        patchDOM(oldChild, childDiff as any);
        updatedChildKeys.add(strI);
      }
    }
  }

  for (const node of deletionList) {
    // запускаем эффекты destroy перед удалением из dom
    runDestroy(node);
    dom.removeChild(node);
  }

  // добавление новых потомков
  const newChildren: (Element | Text | DocumentFragment)[] = [];
  const effects: RenderEffect[] = [];
  for (const keyI in diffChildren) {
    // пропуск уже обработанных
    if (updatedChildKeys.has(keyI)) continue;

    const child = diffChildren[keyI];

    // пропуск пустого изменения
    if (child === emptySymbol) continue;

    // пропуск удаления, ведь все удаления, что могли быть, уже отработали в первом цикле
    if (child === deleteSymbol) continue;

    // пропуск вложенных diff, все они должны отработать ранее
    if (!isPrimitive(child) && !(rawSymbol in child)) continue;

    const content = getContentFromLight(child as any);

    newChildren.push(DOMFromVdom(content, effects));
  }

  if (newChildren.length > 0 && isElement(dom)) {
    dom.append(...newChildren);

    // запуск эффектов только после появления в dom
    effects.forEach((effect) => effect());
  }
}
