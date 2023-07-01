/** перманентное выставление типа */
export function setType<T>(e: unknown): asserts e is T {}

/** перманентное добавление типа */
export function addType<T, K>(e: K): asserts e is T & K {}

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
    if (value === null) {
        return true;
    }
    const t = typeof value;
    return t !== 'object' && t !== 'function';
};

export function isObject<T>(e: T): e is T & object {
    return e !== null && typeof e === 'object';
}
