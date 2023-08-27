export type DOMNamespace = 'xhtml' | 'svg' | 'mathml';

export const namespaceCodes = {
  'http://www.w3.org/1999/xhtml': 'xhtml',
  'http://www.w3.org/2000/svg': 'svg',
  'http://www.w3.org/1998/Math/MathML': 'mathml',
} as const;

export const namespaceNames = {
  xhtml: 'http://www.w3.org/1999/xhtml',
  svg: 'http://www.w3.org/2000/svg',
  mathml: 'http://www.w3.org/1998/Math/MathML',
}  as const;

export type DOMNamespaceName = keyof typeof namespaceCodes;
