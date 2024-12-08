export type DOMNamespace = 'xhtml' | 'svg' | 'mathml';

const NAMESPACE = 'http://www.w3.org/';
const XHTML_NAME = NAMESPACE + '1999/xhtml';
const SVG_NAME = NAMESPACE + '2000/svg';
const MATHML_NAME = NAMESPACE + '1998/Math/MathML';

export const namespaceNames = {
  xhtml: XHTML_NAME,
  svg: SVG_NAME,
  mathml: MATHML_NAME,
} as const;
