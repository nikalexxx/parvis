import { CommonProps, CreateTarget, TreeBuilder } from 'dot-tree-syntax';

import type {
  ComponentAdditionalProps,
  ComponentProps,
  MakeComponent,
} from '../component';
import { DOMNamespace } from './namespace';
import {
  Primitive,
  get_children,
  get_props,
  isArray,
  isFunction,
  isObject,
  isPrimitive,
} from '../utils';
import { TreeProps } from './tree-props';

/**
 * все возможные типы верстки
 */
export type TemplateTreeNode =
  | Primitive
  | TemplateTreeElement
  | TemplateTreeComponent
  | ComponentFunction;

export type TemplateTree = TemplateTreeNode | TemplateTree[];
/**
 * поддержка вложенных массивов
 */
export type TemplateTreeNodeChildSettings = {
  child: TemplateTree;
};

/**
 * общий вид верстки элементов
 */
export type TemplateTreeElement = CreateTarget<
  [DOMNamespace, string],
  CommonProps,
  TemplateTreeNodeChildSettings
>;

/**
 * общий вид верстки компонентов
 */
export type TemplateTreeComponent<P extends ComponentProps = any> =
  CreateTarget<
    MakeComponent<P> & { displayName: string },
    P & TreeProps & ComponentAdditionalProps,
    TemplateTreeNodeChildSettings
  >;

/**
 * функция сборки компонента, в первую очередь для jsx
 */
export type ComponentFunction<P extends ComponentProps = {}> = (<IP extends P>(
  props: IP & TreeProps & ComponentAdditionalProps,
  children: TemplateTree
) => TemplateTreeComponent<IP>) & {
  C: TreeBuilder<TemplateTreeComponent<P>>;
};

export function isTemplateTreeNode(obj: unknown): obj is TemplateTreeNode {
  if (isPrimitive(obj)) return true;

  if (isFunction(obj) && 'C' in obj && isFunction(obj.C)) return true;

  if (!isObject(obj)) return false;

  return (
    'name' in obj &&
    'props' in obj &&
    'children' in obj &&
    isObject(get_props(obj)) &&
    isArray(get_children(obj))
  );
}

export function isElementTemplate(
  template: TemplateTree
): template is TemplateTreeElement {
  return !isPrimitive(template) && !isArray(template) && isArray(template.name);
}

export function isComponentTemplate(
  template: TemplateTree
): template is TemplateTreeComponent {
  return (
    !isPrimitive(template) && !isArray(template) && isFunction(template.name)
  );
}

export function filterTemplateTreeNode(node: TemplateTreeNode): boolean {
  return node !== null && node !== undefined && node !== false;
}

// на самом деле массивы сколь угодно вложенны
export function prepareTempateTree(
  templateTree: TemplateTree[]
): TemplateTreeNode[] {
  return (templateTree as any).flat(Infinity).filter(filterTemplateTreeNode);
}
