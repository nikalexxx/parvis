import { isComponent } from './component';
import { createLightNode } from './light/light';
// import { log } from './utils/log';
import { getContentFromLight } from './materialize/materializeVDOMLight';
import { TemplateTreeNode } from './model/template-tree';
import { Content, isVDOMElement } from './model/vdom-model';
import { namespaceNames } from './model/namespace';
import { elementSymbol } from './symbols';
import { isPrimitive, Primitive } from './utils/type-helpers';
import { createLightElement } from './light/element';
import { getElementFromLight } from './materialize/materializeElement';

export type RenderEffect = (...args: any[]) => void;

export function isElement(node: Node): node is Element {
  return node.nodeType === Node.ELEMENT_NODE;
}

// append(document.body, H.div`Hello, parvis!`)

/** Создание dom из разметки
 *
 * @example
 * Реализует концепцию островов, можно добавлять мультируты в статичную разметку html
 * ```ts
 * render('#app', H.div`Hello, parvis!`);
 * ```
 */
export function render(
  target: Element | string,
  content: TemplateTreeNode
): void {
  const targetElement =
    typeof target === 'string' ? document.querySelector(target) : target;
  if (!targetElement) throw 'target doesnt exist';

  const effects: RenderEffect[] = [];
  const dom = DOM(content, effects);
  targetElement.appendChild(dom);

  // console.log('render', { effects });

  // запуск эффектов (в основном монтирования)
  effects.forEach((effect) => effect());
}

export function DOM(
  template: TemplateTreeNode,
  effects?: RenderEffect[]
): Element | Text {
  // console.group('dom');
  // console.log({ template });
  // подготовка
  const light = createLightNode(template);
  // console.log({ light });

  // материализация, начинают работать компоненты
  const vdom = getContentFromLight(light);
  // console.log({ vdom });
  // console.groupEnd();

  return DOMFromVdom(vdom, effects);
}

export function DOMFromVdom(
  vdom: Content,
  effects?: RenderEffect[]
): Element | Text {
  // текстовые узлы для примитивов
  if (isPrimitive(vdom)) return document.createTextNode(String(vdom));

  // компоненты раскрываются в элементы
  if (isComponent(vdom)) {
    effects?.push(vdom.effects.mount);
    const template = vdom.render();
    // подготовка
    const light = createLightElement(template);
    // обновляем light vdom
    vdom.externalEffects.updateLight(light);

    // материализация
    const element = getElementFromLight(light);
    // привязываем элемент
    vdom.externalEffects.bindElement(element);

    const dom = DOMFromVdom(element, effects);

    // уже после включения в дерево на странице привязываем реальный dom
    effects?.push(() => vdom.externalEffects.append(dom));
    return dom;
  }

  // далее только элементы
  const {
    namespace,
    tagName,
    attributes = {},
    utilityProps,
    children = {},
    childOrder = [],
    eventListeners = {},
  } = vdom;

  const domElement = document.createElementNS(
    namespaceNames[namespace],
    tagName
  );

  // связь виртуального dom с реальным
  if (!vdom.dom) vdom.dom = {};
  vdom.dom.ref = domElement;
  domElement[elementSymbol] = vdom;

  // аттрибуты
  for (const prop of Object.keys(attributes)) {
    // пропуск всех технических атрибутов
    if (prop.startsWith('_')) continue;
    const value = attributes[prop];
    if (value === false || value === null || value === undefined) continue;

    // FIXME: следует отличать аттрибуты в html от аттрибутов в js
    if (value === true) {
      domElement.toggleAttribute(prop);
    } else {
      domElement.setAttribute(prop, `${value}`);
    }
  }

  // обработка событий
  for (const eventName of Object.keys(eventListeners)) {
    // TODO: когда отписываться?
    domElement.addEventListener(eventName, eventListeners[eventName], false);
  }

  // содержимое элемента
  if ('_html' in utilityProps) {
    domElement.innerHTML = `${utilityProps._html}`;
  } else if (childOrder.length > 0) {
    const childList = childOrder.map((key) => {
      const child = children[key];
      const dom = DOMFromVdom(child, effects);
      if (isVDOMElement(child)) {
        if (!child.dom) child.dom = {};
        child.dom.parent = domElement;
      }
      return dom;
    });
    domElement.append(...childList);
  }

  // вызов функции для привязки к странице
  utilityProps._ref?.(domElement);

  return domElement;
}
