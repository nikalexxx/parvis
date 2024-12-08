import { get_children, isPrimitive } from '../utils';

export type ChildrenByKeys<T> = {
  children: Record<string, T>;
  order: string[];
};

export function getChildrenByKeys<T>(
  list: T[],
  getKey: (item: T) => string | undefined
): {
  childrenByKeys: ChildrenByKeys<T>;
  dublicate: Set<string>;
} {
  const childrenByKeys: ChildrenByKeys<T> = {
    children: Object.create(null),
    order: [],
  };
  const dublicate = new Set<string>();
  for (let i = 0; i < list.length; i++) {
    const node = list[i];
    let key = isPrimitive(node) ? `@${i}` : getKey(node) ?? `@${i}`;
    if (key in get_children(childrenByKeys)) {
      dublicate.add(key);
      // FIXME: ключ может совпадать с другим числом
      key = `@${i}`;
    }
    childrenByKeys.children[key] = node;
    childrenByKeys.order.push(key);
  }
  if (dublicate.size > 0) {
    console.warn(`Dublicate keys: ${Array.from(dublicate).join(', ')}`);
  }
  return { childrenByKeys, dublicate };
}
