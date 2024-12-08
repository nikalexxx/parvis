// @ts-nocheck
import { console_log, obj_keys } from './global_functions';
import {
  isArray,
  isFunction,
  isObject,
  isPrimitive,
  Primitive,
} from './type-helpers';

const deleteS = Symbol('delete');
export type DeleteSymbol = typeof deleteS;
export const del = (x: any): x is DeleteSymbol => x === deleteS;
export const emptyS = Symbol('empty');
export type EmptySymbol = typeof emptyS;
export const empt = (x: any): x is EmptySymbol => x === emptyS;
export const arrayS = Symbol('array');
export type ArraySymbol = typeof arrayS;
export const rawS = Symbol('raw');
export type RawSymbol = typeof rawS;

export type DiffByKeys<
  A extends Record<any, any>,
  B extends Record<any, any>
> = {
  [J in keyof (A & B)]: Diff<A[J], B[J]>;
};

export type Diff<RawA = any, RawB = RawA> =
  | DeleteSymbol
  | EmptySymbol
  | (Primitive & RawB)
  | ({
      [arrayS]?: true;
    } & (RawA extends Record<any, any>
      ? RawB extends Record<any, any>
        ? DiffByKeys<RawA, RawB>
        : {}
      : {}))
  | ({
      [rawS]: true;
      [arrayS]?: true;
    } & RawB);

/** обёртка для любого объекта */
export const raw = <T, U = any>(value: T): T & Diff<U, T> => {
  if (isPrimitive(value)) return value;
  // @ts-ignore
  value[rawS] = true;
  return value as Diff;
};

export function isDiffRaw<A, B, D extends Diff<A, B>>(diff: D | B): diff is B {
  return (isObject(diff) || isFunction(diff)) && rawS in diff;
}

export function diff<T1 extends unknown, T2 extends unknown>(
  A: T1,
  B: T2
): Diff<T1, T2> {
  // равенство по значению(для примитивов), либо по ссылке(для объектов)
  // @ts-ignore
  if (A === B) return emptyS;
  if (isPrimitive(A)) return raw(B);
  if (isPrimitive(B)) return B;

  if (isFunction(A)) {
    // для функций заменяем всё, возможно стоит добавить другую проверку
    if (A === B) {
      return emptyS;
    }
    return raw(B);
  }

  if (isArray(A)) {
    // просто всё затираем
    if (!isArray(B)) return raw(B);
    // сравнение массивов
    return diffArray(A, B);
  }

  // A — объект
  // не обычный объект
  if (isFunction(B) || isArray(B)) return raw(B);

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
      if (!empt(indexDiff)) {
        result[String(i)] = indexDiff; // добавляем только отличия
      }
    } else if (lA < lB) {
      result[String(i)] = raw(B[i]); // новые элементы
    } else {
      result[String(i)] = deleteS; // удаляем лишние
    }
  }
  if (obj_keys(result).length > 0) {
    result[arrayS] = true;
    return result;
  } else {
    return emptyS;
  }
}

export function diffObject<
  O1 extends Record<any, any>,
  O2 extends Record<any, any>
>(A: O1, B: O2, compare: (o1: O1, o2: O2) => Diff = diff): Diff {
  const result: Diff = {};
  for (const key of obj_keys(B)) {
    // новые ключи добавляем как есть
    if (!A.hasOwnProperty(key)) result[key] = raw(B[key]);
  }
  for (const key of obj_keys(A)) {
    if (!B.hasOwnProperty(key)) {
      result[key] = deleteS; // удаляем старые ключи
      continue;
    }
    const keyDiff = compare(A[key], B[key]); // сравниваем рекурсивно
    if (!empt(keyDiff)) result[key] = keyDiff; // добавляем только отличия
  }
  if (obj_keys(result).length > 0) return result;
  return emptyS;
}

const logNewValue = (s: string) => console_log('%c + ' + s, 'color: blue');
const logAdded = (s: string) => console_log('%c + ' + s, 'color: green');
const logDeleted = (s: string) =>
  console_log('%c - ' + (s || '<delete>'), 'color: red');

function removeEmpty<A, B>(diff: Diff<A, B>): Diff<A, B> {
  if (!isObject(diff)) return diff;
  const newDiff = { ...diff };
  for (const name of obj_keys(diff)) {
    const subDiff = removeEmpty(diff[name]);
    if (empt(subDiff)) delete newDiff[name];
  }
  if (obj_keys(newDiff).length === 0) return emptyS;
  return diff;
}

export function printDiff<A, B>(rawdiff: Diff<A, B>): void {
  const cleanDiff = removeEmpty(rawdiff);
  if (empt(cleanDiff)) return;
  if (cleanDiff === deleteS) {
    logDeleted('');
  } else if (isPrimitive(cleanDiff)) {
    logNewValue(String(cleanDiff));
  } else if (rawS in cleanDiff) {
    if (isFunction(cleanDiff)) return logNewValue(cleanDiff.toString());
    return logAdded(JSON.stringify(cleanDiff, null, 2));
  }

  for (const name of obj_keys(cleanDiff)) {
    const subDiff = cleanDiff[name];
    if (empt(subDiff)) continue;
    console.group(name);
    printDiff(subDiff);
    console.groupEnd();
  }
}
