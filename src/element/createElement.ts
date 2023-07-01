import {
  VDOMLightProps,
  ChildrenByKeys,
  Content,
  HTML_TAG,
  VDOMElement,
  DOMNamespace,
} from '../model';
import { elementSymbol, vdomNodeSymbol } from '../symbols';
import { assign } from '../utils';
import { groupLightProps } from './lightPropsGroups';

/**
 * получение пустого элемента без свойств, событий и содержимого
 * */
function getEmptyVDOMElement(
  namespace: DOMNamespace,
  tagName: HTML_TAG
): VDOMElement {
  const element: VDOMElement = {
    namespace,
    tagName,
    attributes: {},
    children: {},
    childOrder: [],
    eventListeners: {},
    utilityProps: {},
    subComponents: {},
    dom: {},
    nodeType: Node.ELEMENT_NODE,
    [elementSymbol]: true,
    [vdomNodeSymbol]: true,
  };

  return element;
}

export const createElement = (
  namespace: DOMNamespace,
  tagName: HTML_TAG = 'div',
  props: VDOMLightProps,
  childrenByKeys: ChildrenByKeys<Content>
) => {
  const element = getEmptyVDOMElement(namespace, tagName);

  // разделение на атрибуты и слушатели
  const { attributes, eventListeners, utilityProps } = groupLightProps(props);
  assign(element, 'attributes', attributes);
  assign(element, 'eventListeners', eventListeners);
  assign(element, 'utilityProps', utilityProps);

  element.children = childrenByKeys.children;
  element.childOrder = childrenByKeys.order;

  return element;
};
