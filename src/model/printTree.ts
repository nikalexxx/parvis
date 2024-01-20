import { CommonProps } from 'dot-tree-syntax';
import { Primitive, isPrimitive } from '../utils';
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
  if (Array.isArray(value)) return `[${value.map(printValue).join(', ')}]`;
  if (isPrimitive(value)) return printPrimitive(value);

  if (typeof value === 'function') {
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
  let propsLine = Object.keys(props)
    .map((key) => `${key}={${printValue(props[key])}}`)
    .join(' ');

  if (propsLine.length > 1) propsLine = ' ' + propsLine;

  if (children.length === 0) {
    return `<${name}${propsLine} />`;
  }

  return `<${name}${propsLine}>\n${children}\n${padding}</${name}>`;
}

export function printTree(tree: TemplateTree, level = 0): string {
  const padding = ' │ '.repeat(level);
  const childPadding = ' │ '.repeat(level + 1);
  if (Array.isArray(tree))
    return `<>\n${tree
      .map((node) => childPadding + printTree(node, level + 1))
      .join(`\n`)}\n</>`;
  if (isPrimitive(tree)) return `${tree}`;

  if (isElementTemplate(tree)) {
    const { name, props, children } = tree;

    return printJSX(
      name[1],
      props,
      children
        .map((node) => childPadding + printTree(node, level + 1))
        .join('\n'),
      padding
    );
  }

  if (isComponentTemplate(tree)) {
    const { name, props, children } = tree;

    return printJSX(
      name.displayName,
      props,
      children
        .map((node) => childPadding + printTree(node, level + 1))
        .join('\n'),
      padding
    );
  }

  return `--unknown node--`;
}
