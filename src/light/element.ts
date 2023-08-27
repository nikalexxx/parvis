import type { VDOMLightElement, TemplateTreeElement } from '../model';
import { prepareChildren } from './light';

const listenerCache: Map<string, string> = new Map();
function getBasicName(name: string): string {
  if (name.startsWith('on') && name[2] !== ':') {
    if (listenerCache.has(name)) return listenerCache.get(name)!;
    if (/^[A-Z]$/.test(name[2])) {
      const basicName = `on:${name[2].toLowerCase()}${name.slice(3)}`;
      listenerCache.set(name, basicName);
      return basicName;
    }
  }
  return name;
}

export function createLightElement(
  target: TemplateTreeElement
): VDOMLightElement {
  const {
    children = [],
    props = {},
    name: [namespace, tagName],
  } = target;

  const element: VDOMLightElement = {
    namespace,
    tagName,
  };

  if (Object.keys(props).length > 0) {
    const { _attributes = {}, ...other } = props;
    const rawProps = Object.assign(other, _attributes);

    // FIXME: здесь нужно отличать шаблонные списки от остальных, либо передавать знание в билдер
    element.props = Object.fromEntries(
      Object.entries(rawProps).map(([name, value]) => [
        getBasicName(name),
        Array.isArray(value) ? value.join('') : value,
      ])
    );
  }

  if (children.length > 0) element.children = prepareChildren(children as any);

  return element;
}
