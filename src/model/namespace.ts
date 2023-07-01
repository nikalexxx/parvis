export const enum DOMNamespace {
    xhtml,
    svg,
    mathml,
}

export const namespaceCodes = {
    'http://www.w3.org/1999/xhtml': DOMNamespace.xhtml,
    'http://www.w3.org/2000/svg': DOMNamespace.svg,
    'http://www.w3.org/1998/Math/MathML': DOMNamespace.mathml,
} as const;

export const namespaceNames = {
    [DOMNamespace.xhtml]: 'http://www.w3.org/1999/xhtml',
    [DOMNamespace.svg]: 'http://www.w3.org/2000/svg',
    [DOMNamespace.mathml]: 'http://www.w3.org/1998/Math/MathML',
} as const;

export type DOMNamespaceName = keyof typeof namespaceCodes;
