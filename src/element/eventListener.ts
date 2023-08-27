const EVENT_LISTENER_PREFIX = 'on:';

export function isListener(
  propName: string,
  value: unknown
): value is EventListener {
  return propName.startsWith(EVENT_LISTENER_PREFIX);
}

/**
 * получение типа dom события на основе имени метода
 * @example 'on:click' -> 'click'
 */
export const getEventName = (prop: string) => prop.slice(3);
