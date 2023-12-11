// @ts-nocheck
import { isObject, isPrimitive, Primitive } from './type-helpers';

export const deleteSymbol = Symbol('delete');
export type DeleteSymbol = typeof deleteSymbol;
export const emptySymbol = Symbol('empty');
export type EmptySymbol = typeof emptySymbol;
export const arraySymbol = Symbol('array');
export type ArraySymbol = typeof arraySymbol;
export const rawSymbol = Symbol('raw');
export type RawSymbol = typeof rawSymbol;
export const metaSymbol = Symbol('meta');
export type MetaSymbol = typeof metaSymbol;
export const newSymbol = Symbol('new');
export type NewSymbol = typeof newSymbol;

const D = {
  delete: deleteSymbol,
  empty: emptySymbol,
  array: arraySymbol,
  raw: rawSymbol,
  meta: metaSymbol,
  new: newSymbol,
} as const;

type DiffOp = typeof D;

type EXTENDS<A, B> = [A, B];
type AND<
  A extends EXTENDS<any, any>,
  B extends EXTENDS<any, any>,
  IfT,
  IfF
> = A[0] extends A[1] ? (B[0] extends B[1] ? IfT : IfF) : IfF;
type OR<
  A extends EXTENDS<any, any>,
  B extends EXTENDS<any, any>,
  IfT,
  IfF
> = A[0] extends A[1] ? IfT : B[0] extends B[1] ? IfT : IfF;

export type DiffByKeys<
  A extends Record<any, any>,
  B extends Record<any, any>,
  Meta = any
> = {
  [J in keyof (A & B)]: Diff<A[J], B[J], Meta>;
};

export type Diff<RawA = any, RawB = RawA, Meta = never> =
  | DiffOp['delete']
  | DiffOp['empty']
  | (Primitive & RawB)
  | ({
      [arraySymbol]?: true;
      [metaSymbol]?: Meta;
    } & (RawA extends Record<any, any>
      ? RawB extends Record<any, any>
        ? DiffByKeys<RawA, RawB, Meta>
        : {}
      : {}))
  | ({
      [rawSymbol]: true;
      [arraySymbol]?: true;
      [metaSymbol]?: Meta;
    } & RawB);

/** обёртка для любого объекта */
export const raw = <T, U = any>(value: T): T & Diff<U, T> => {
  if (isPrimitive(value)) return value;
  // @ts-ignore
  value[rawSymbol] = true;
  return value as Diff;
};

export function isDiffRaw<A, B, D extends Diff<A, B>>(diff: D | B): diff is B {
  return isObject(diff) && rawSymbol in diff;
}

export function diff<T1 extends unknown, T2 extends unknown>(
  A: T1,
  B: T2
): Diff<T1, T2> {
  // равенство по значению(для примитивов), либо по ссылке(для объектов)
  // @ts-ignore
  if (A === B) return emptySymbol;
  if (isPrimitive(A)) return raw(B);
  if (isPrimitive(B)) return B;

  if (typeof A === 'function') {
    // для функций заменяем всё, возможно стоит добавить другую проверку
    if (A === B) {
      return emptySymbol;
    }
    return raw(B);
  }

  if (Array.isArray(A)) {
    // просто всё затираем
    if (!Array.isArray(B)) return raw(B);
    // сравнение массивов
    return diffArray(A, B);
  }

  // A — объект
  // не обычный объект
  if (typeof B === 'function' || Array.isArray(B)) return raw(B);

  // сравнение объектов
  return diffObject(A, B);
}

/** сравнение массивов */
export function diffArray<L1 extends any[], L2 extends any[]>(
  A: L1,
  B: L2,
  compare: (l1: L1[number], l2: L2[number]) => Diff = diff
): Diff<L1, L2> {
  const lA = A.length;
  const lB = B.length;
  const max = lA > lB ? lA : lB;
  const min = lA < lB ? lA : lB;
  const result: Diff = {};
  for (let i = 0; i < max; i++) {
    if (i < min) {
      // сравниваем общую часть
      const indexDiff = compare(A[i], B[i]); // сравниваем элементы
      if (indexDiff !== emptySymbol) {
        result[String(i)] = indexDiff; // добавляем только отличия
      }
    } else if (lA < lB) {
      result[String(i)] = raw(B[i]); // новые элементы
    } else {
      result[String(i)] = deleteSymbol; // удаляем лишние
    }
  }
  if (Object.keys(result).length > 0) {
    result[D.array] = true;
    return result;
  } else {
    return emptySymbol;
  }
}

export function diffObject<
  O1 extends Record<any, any>,
  O2 extends Record<any, any>
>(A: O1, B: O2, compare: (o1: O1, o2: O2) => Diff = diff): Diff {
  const result: Diff = {};
  for (const key of Object.keys(B)) {
    if (!A.hasOwnProperty(key)) {
      result[key] = raw(B[key]); // новые ключи добавляем как есть
    }
  }
  for (const key of Object.keys(A)) {
    if (!B.hasOwnProperty(key)) {
      result[key] = deleteSymbol; // удаляем старые ключи
      continue;
    }
    const keyDiff = compare(A[key], B[key]); // сравниваем рекурсивно
    if (keyDiff !== emptySymbol) {
      result[key] = keyDiff; // добавляем только отличия
    }
  }
  if (Object.keys(result).length > 0) {
    return result;
  }
  return emptySymbol;
}

diff.symbols = D;

function logNewValue(s: string): void {
  console.log('%c + ' + s, 'color: blue');
}

function logAdded(s: string): void {
  console.log('%c + ' + s, 'color: green');
}

function logDeleted(s: string): void {
  console.log('%c - ' + (s || '<delete>'), 'color: red');
}

function removeEmpty<A, B>(diff: Diff<A, B>): Diff<A, B> {
  if (!isObject(diff)) return diff;
  const newDiff = { ...diff };
  for (const name of Object.keys(diff)) {
    const subDiff = removeEmpty(diff[name]);
    if (subDiff === emptySymbol) {
      delete newDiff[name];
    }
  }
  if (Object.keys(newDiff).length === 0) return emptySymbol;
  return diff;
}

export function printDiff<A, B>(rawdiff: Diff<A, B>): void {
  const cleanDiff = removeEmpty(rawdiff);
  if (cleanDiff === emptySymbol) return;
  if (cleanDiff === deleteSymbol) {
    logDeleted('');
    return;
  }
  if (isPrimitive(cleanDiff)) {
    logNewValue(String(cleanDiff));
    return;
  }
  if (rawSymbol in cleanDiff) {
    if (typeof cleanDiff === 'function') {
      logNewValue(cleanDiff.toString());
      return;
    }
    logAdded(JSON.stringify(cleanDiff, null, 2));
    return;
  }

  for (const name of Object.keys(cleanDiff)) {
    const subDiff = cleanDiff[name];
    if (subDiff === emptySymbol) continue;
    console.group(name);
    printDiff(subDiff);
    console.groupEnd();
  }
}
