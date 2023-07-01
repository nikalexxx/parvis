import { runDomAction } from '../model';
import { Primitive } from '../utils';

export function setAttribute(
  element: Element,
  name: string,
  value: Primitive
): void {
  if (value === false || value === null || value === undefined) {
    if (element.hasAttribute(name)) {
      element.removeAttribute(name);
    }
  } else if (value === true) {
    element.toggleAttribute(name);
  } else {
    element.setAttribute(name, `${value}`);
  }
  runDomAction(element, name, value);
}
