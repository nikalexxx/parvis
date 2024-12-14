import { DOMFromVdom, isElement, RenderEffect } from '../dom';
import { elementSymbol } from '../symbols';
import {
  arrayS,
  Diff,
  DiffByKeys,
  del,
  isDiffRaw,
  empt,
  rawS,
} from '../utils/diff';
import {
  isFunction,
  isObject,
  isPrimitive,
  setType,
} from '../utils/type-helpers';
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
import { runEffects } from './effects';
import { console_log, get_children, obj_keys } from '../utils';

/** Точечное изменение dom по diff */
export function patchDOM(
  dom: Node,
  diffObject: DiffVDOMLight,
  debugChildrenLevel?: number
) {
  const parent = dom.parentNode;
  if (!parent) return;

  // console_log('patchDom', { dom, diffObject });

  if (empt(diffObject)) return;

  if (del(diffObject)) {
    // слабые ссылки могли бы помочь

    // console_log('patchDOM/delete', { diffObject, dom });

    // запуск хуков
    runDestroy(dom);

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
      runDestroy(dom);

      parent.replaceChild(document.createTextNode(text), dom);
    }
    return;
  }

  if (rawS in diffObject) {
    const light = diffObject as VDOMLightNode;

    const content = getContentFromLight(light);
    const effects: RenderEffect[] = [];

    const newDom = DOMFromVdom(content, effects);

    runDestroy(dom);

    parent.replaceChild(newDom, dom);

    if (isVDOMElement(light)) {
      light.dom.ref = newDom;
      light.dom.parent = parent;
    }

    // запуск эффектов только после обновления в dom
    runEffects(effects);

    return;
  }

  if (arrayS in diffObject) return;

  // далее честный diff

  if ('get' in diffObject) {
    // изменение компонента
    const { component } = dom[elementSymbol] ?? {};
    if (!component) return; // ошибка

    // компонент сам разбирается с обновлением
    component.applyDiff(
      diffObject as any,
      debugChildrenLevel !== undefined ? debugChildrenLevel + 1 : undefined
    );

    return;
  }

  if (!isElement(dom)) return;

  // далее diff по элементам
  setType<DiffByKeys<VDOMLightElement, VDOMLightElement>>(diffObject);

  const props = diffObject.props as Diff<VDOMLightProps, VDOMLightProps>;
  const { attributes, eventListeners } = groupLightProps(
    props as VDOMLightProps
  );

  // console_log('patchDom/element', { attributes, eventListeners });

  if (obj_keys(attributes).length > 0) {
    patchAttributes({ dom, diffAttributes: attributes });
  }

  if (obj_keys(eventListeners).length > 0) {
    patchEventListeners({ dom, diffEventListeners: eventListeners });
  }

  patchChildNodes({
    dom,
    diffChildren: get_children(diffObject) as Diff<VDOMLightNode[]>,
    debugChildrenLevel,
  });

  if (dom.tagName === 'TEXTAREA') runDomAction(dom, 'value', dom.innerHTML);
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
    // console_log('patchDom/patchAttributes', {name})
    const diffAttribute = diffAttributes[name];

    if (empt(diffAttribute)) continue;

    if (del(diffAttribute)) {
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
  // console_log('patchDom/patchEventListeners', { diffEventListeners });

  // удаление старых перехватчиков событий
  const oldListeners = dom[elementSymbol]?.eventListeners ?? {};

  // обновление перехватчиков событий
  for (const eventName of obj_keys(diffEventListeners)) {
    const oldListener = oldListeners[eventName];
    const listener = diffEventListeners[eventName];

    if (empt(listener)) continue;

    if (del(listener) && oldListener) {
      dom.removeEventListener(eventName, oldListener);
      delete oldListeners[eventName];
      continue;
    }

    let listenerFn: EventListener;
    if (isFunction(listener)) listenerFn = listener;
    else if (isObject(listener) && 'handleEvent' in listener) {
      if (isDiffRaw(listener.handleEvent)) {
        listenerFn = listener.handleEvent as any;
      } else if (empt(listener.handleEvent)) {
        continue;
      } else if (del(listener.handleEvent) && oldListener) {
        dom.removeEventListener(eventName, oldListener);
        delete oldListeners[eventName];
        continue;
      }
      continue;
    } else continue;

    if (oldListener) {
      oldListener.handleEvent = listenerFn;
    } else {
      dom.addEventListener(eventName, { handleEvent: listenerFn }, false);
    }
  }
}

type PatchChildNodesParams = {
  dom: Element;
  diffChildren: Diff<VDOMLightNode[]>;
  debugChildrenLevel?: number;
};

export function patchChildNodes({
  dom,
  diffChildren,
  debugChildrenLevel,
}: PatchChildNodesParams) {
  if (empt(diffChildren)) return;
  if (del(diffChildren)) {
    dom.innerHTML = '';
    return;
  }

  if (!isObject(diffChildren)) return;
  if (!(arrayS in diffChildren)) return;
  // обновление существующих потомков

  const element = dom[elementSymbol];
  if (!element) return;

  const oldNodes = dom.childNodes;
  const { childOrder, children } = element;

  // ключи, которые были обновлены
  const updatedChildKeys = new Set<string>();

  // console_log({childOrder, oldNodes});

  const deletionList: Node[] = [];
  for (let i = 0; i < oldNodes.length; i++) {
    const oldChild = oldNodes[i];
    const key = childOrder[i]; // TODO: поддержать логику с key
    const strI = `${i}`;
    // console_log('patchDom/patchChildNodes/index', {strI})

    if (strI in diffChildren) {
      const childDiff = diffChildren[strI as any];
      if (del(childDiff)) {
        // собираем узлы на удаление, чтобы не нарушать порядок
        deletionList.push(oldChild);
      } else {
        patchDOM(oldChild, childDiff as any, debugChildrenLevel);
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
    if (empt(child)) continue;

    // пропуск удаления, ведь все удаления, что могли быть, уже отработали в первом цикле
    if (del(child)) continue;

    // пропуск вложенных diff, все они должны отработать ранее
    if (!isPrimitive(child) && !(rawS in child)) continue;

    const content = getContentFromLight(child as any);

    newChildren.push(DOMFromVdom(content, effects));
  }

  if (newChildren.length > 0 && isElement(dom)) {
    dom.append(...newChildren);

    // запуск эффектов только после появления в dom
    runEffects(effects);
  }
}
