import type { Primitive } from '../utils';

// for controlled elements
export function runDomAction(
  element: Element,
  prop: string,
  value: Primitive
): void {
  const { tagName } = element;
  if (prop === 'selected' && tagName === 'OPTION') {
    (element as any).selected = value;
    return;
  }
  if (prop === 'value' && (tagName === 'INPUT' || tagName === 'TEXTAREA')) {
    (element as any).value = value;
  }
}
