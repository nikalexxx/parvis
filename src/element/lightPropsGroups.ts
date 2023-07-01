import type { VDOMLightProps, VDOMElement } from "../model";
import { getEventName, isListener } from "./eventListener";

type GroupedLightProps = Pick<VDOMElement, 'attributes' | 'eventListeners' | 'utilityProps'>;

export function groupLightProps(props: VDOMLightProps): GroupedLightProps {
    const grouped: GroupedLightProps = {
        attributes: {},
        eventListeners: {},
        utilityProps: {},
    };

    for (const propName in props) {
        const value = props[propName];
        if (propName[0] === '_') {
            grouped.utilityProps[propName as keyof GroupedLightProps['utilityProps']] = value;
        } else if (isListener(propName, value)) {
            const eventName = getEventName(propName);
            if (typeof value !== 'function') {
                console.error(
                    new Error(`${eventName} listener is not function`)
                );
                continue;
            }
            grouped.eventListeners[eventName] = value;
        } else {
            grouped.attributes[propName] = value;
        }
    }

    return grouped;
}
