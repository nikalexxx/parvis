import { CommonProps } from 'dot-tree-syntax';
import {
  Primitive,
  isArray,
  isFunction,
  isPrimitive,
  obj_keys,
} from '../utils';
import {
  TemplateTree,
  isComponentTemplate,
  isElementTemplate,
  isTemplateTreeNode,
} from './template-tree';

function printPrimitive(value: Primitive): string {
  if (typeof value === 'string') return `"${value}"`;
  return `${value}`;
}

function printValue(value: unknown): string {
  if (isArray(value)) return `[${value.map(printValue).join(', ')}]`;
  if (isPrimitive(value)) return printPrimitive(value);

  if (isFunction(value)) {
    let fnLine = value.toString().replace(/\/\* @__PURE__ \*\//g, '');

    if (fnLine.includes('jsx')) {
      fnLine = fnLine
        .replace(/\s*(fileName|lineNumber|columnNumber)\:.+,?/g, '')
        .replace(/,\s*void 0,\s*(true|false),\s*\{\s*\},\s*this/g, '')
        .replace(/jsxDEV/g, 'jsx');
    }

    return fnLine;
  }

  if (isTemplateTreeNode(value)) return printTree(value);

  return JSON.stringify(value, null, 2);
}

function printJSX(
  name: string,
  props: CommonProps,
  children: string,
  padding = ''
): string {
  let propsLine = obj_keys(props)
    .map((key) => `${key}={${printValue(props[key])}}`)
    .join(' ');

  if (propsLine.length > 1) propsLine = ' ' + propsLine;
  return children.length > 0
    ? `<${name}${propsLine}>\n${children}\n${padding}</${name}>`
    : `<${name}${propsLine} />`;
}

let getPadding = (level: number) => ' │ '.repeat(level);
export function printTree(tree: TemplateTree, level = 0): string {
  const padding = getPadding(level);
  const childPadding = getPadding(level + 1);
  let print_list = (children: TemplateTree[]) =>
    children
      .map((node) => childPadding + printTree(node, level + 1))
      .join('\n');

  if (isArray(tree)) return `<>\n${print_list(tree)}\n</>`;
  if (isPrimitive(tree)) return `${tree}`;
  if (isFunction(tree)) return tree.toString();

  const { props, children } = tree;
  const name = isElementTemplate(tree)
    ? tree.name[1]
    : isComponentTemplate(tree)
    ? tree.name.displayName
    : null;
  return name
    ? printJSX(name, props, print_list(children), padding)
    : `--unknown node--`;
}
