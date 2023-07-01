import { VDOMLightElement, getChildrenByKeys, getContentKey, VDOMElement } from '../model';
import { createElement } from '../element';
import { getContentFromLight } from './materializeVDOMLight';

export function getElementFromLight(light: VDOMLightElement): VDOMElement {
    const { namespace, tagName, children = [], props } = light;

    const { childrenByKeys } = getChildrenByKeys(
        children.map(getContentFromLight),
        getContentKey
    );

    const element = createElement(
        namespace,
        tagName as any,
        props ?? {},
        childrenByKeys
    );

    return element;
}
