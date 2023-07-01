import { elementSymbol } from '../symbols';
import { ComponentBindedDOMData } from './model';

export function findParentComponent(node: Node): ComponentBindedDOMData | null {
  let currentNode: Node | null = node;
  while (currentNode !== null) {
    const element = currentNode[elementSymbol];
    if (element?.component) {
      return {
        component: element.component,
        element: element,
        domElement: currentNode,
      };
    }
    currentNode = currentNode.parentNode;
  }
  return null;
}
