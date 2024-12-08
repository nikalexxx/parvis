import { obj_assign } from './global_functions';

export function assign<T extends Record<string, any>, K extends keyof T>(
  object: T,
  prop: K,
  value: T[K]
): T {
  if (prop in object) {
    obj_assign(object[prop], value);
  } else {
    object[prop] = value;
  }
  return object;
}
