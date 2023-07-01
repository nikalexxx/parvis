import type { VDOMLightElement, TemplateTreeElement } from '../model';
import { prepareChildren } from './light';

export function createLightElement(
    target: TemplateTreeElement
): VDOMLightElement {
    const {
        children = [],
        props = {},
        name: [namespace, tagName],
    } = target;

    const element: VDOMLightElement = {
        namespace,
        tagName,
    };

    if (Object.keys(props).length > 0) {
        const { _attributes = {}, ...other } = props;
        const rawProps = Object.assign(other, _attributes);

        // FIXME: здесь нужно отличать шаблонные списки от остальных, либо передавать знание в билдер
        element.props = Object.fromEntries(
            Object.entries(rawProps).map(([name, value]) => [
                name,
                Array.isArray(value) ? value.join('') : value,
            ])
        );
    }

    if (children.length > 0)
        element.children = prepareChildren(children as any);

    return element;
}
