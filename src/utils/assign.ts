export function assign<T extends Record<string, any>, K extends keyof T>(object: T, prop: K, value: T[K]): T {
    if (prop in object) {
        Object.assign(object[prop], value);
    } else {
        object[prop] = value
    }
    return object;
}
