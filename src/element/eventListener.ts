export function isListener(propName: string, value: unknown): value is EventListener {
    return (
        propName.length > 2 &&
        propName.startsWith('on') &&
        propName[2] === propName[2].toUpperCase()
    );
}

/**
 * получение типа dom события на основе имени метода
 * @example 'onClick' -> 'click'
 */
export const getEventName = (prop: string) =>
    `${prop[2].toLowerCase()}${prop.slice(3)}`;
