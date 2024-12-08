import { FN, OBJ } from './global_strings';

/** перманентное выставление типа */
export function setType<T>(e: unknown): asserts e is T {}

export type Primitive = string | number | boolean | null | undefined | bigint;
export type GetPrimitiveFromLiteral<L> = L extends string
  ? string
  : L extends number
  ? number
  : L extends boolean
  ? boolean
  : L extends bigint
  ? bigint
  : L;

export const isPrimitive = <T>(value: T): value is Primitive & T => {
  if (value === null) return true;
  const t = typeof value;
  return t !== OBJ && t !== FN;
};

export function isObject<T>(e: T): e is T & object {
  return e !== null && typeof e === OBJ;
}

export function isFunction<T>(e: T): e is T & ((...args: any[]) => any) {
  return typeof e === FN;
}

export const isArray = Array.isArray;
