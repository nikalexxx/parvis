import {
  VDOMLightProps,
  ChildrenByKeys,
  Content,
  HTML_TAG,
  VDOMElement,
  DOMNamespace,
} from '../model';
import { elementSymbol, vdomNodeSymbol } from '../symbols';
import { assign, get_children } from '../utils';
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
  const lightProps = groupLightProps(props);
  assign(element, 'attributes', lightProps.attributes);
  assign(element, 'eventListeners', lightProps.eventListeners);
  assign(element, 'utilityProps', lightProps.utilityProps);

  element.children = get_children(childrenByKeys);
  element.childOrder = childrenByKeys.order;

  return element;
};
