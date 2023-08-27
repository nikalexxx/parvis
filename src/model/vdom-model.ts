import type { VDOMComponent } from '../component';
import { DOMNamespace } from './namespace';
import { elementSymbol, vdomNodeSymbol } from '../symbols';
import { isObject, Primitive, isPrimitive } from '../utils';
import { TreeProps } from './tree-props';

export type HTML_TAG = keyof HTMLElementTagNameMap;
export type SVG_TAG = keyof SVGElementTagNameMap;

export type Tags = {
    xhtml: HTML_TAG;
    svg: SVG_TAG;
    mathml: string;
};

// типы контента
export type Content = VDOMElement | VDOMComponent | Primitive;

// тип контента до обработки
export type RawContent = Content | (() => Content);

// массивы любой вложенности
export type Container = Content | (Content | Container)[];

export type RawContainer = RawContent | (RawContent | RawContainer)[];

export type CustomProps = {
    _ref?: (e: Element) => void;
    _html?: string;
};

export type VDOMNode = {
    /** вложенные ноды */
    children: Record<string, Content>;

    childOrder: string[];

    subComponents?: Record<string, VDOMComponent>;

    component?: VDOMComponent;

    [vdomNodeSymbol]: true;
};

export type VDOMRefDom = {
    /** привязка к реальному DOM */
    dom: {
        ref?: Node; // на текущую ноду
        parent?: Node; // на родительскую
    };
}


export type VDOMElement<N extends DOMNamespace = DOMNamespace> = VDOMNode & VDOMRefDom & {
    nodeType: number;
    namespace: N;
    tagName: Tags[N];

    /** атрибуты */
    attributes: Record<string, Primitive>;

    /** обработчики событий */
    eventListeners: Record<string, EventListener>;

    /** технические свойства */
    utilityProps: CustomProps & TreeProps;

    [elementSymbol]: true;
};

export type VDOMElementAttributes = Required<VDOMElement>['attributes'];
export type VDOMChildren = Required<VDOMElement>['children'];
export type VDOMElementEventListeners = Required<VDOMElement>['eventListeners'];

export function isVDOMNode(e: unknown): e is VDOMNode {
    return isObject(e) && vdomNodeSymbol in e;
}

export function isVDOMElement(e: unknown): e is VDOMElement {
    return isVDOMNode(e) && elementSymbol in e;
}

export function getContentKey(content: Content): string | undefined {
    if (isPrimitive(content)) return undefined;
    if (isVDOMElement(content)) return content.utilityProps._key;
    return content.props._key;
}


window.vdom = function vdom(e: Node | undefined | null) {
    return e ? e[elementSymbol] : undefined;
};
