import { CommonProps, CreateTarget, TreeBuilder } from 'dot-tree-syntax';

import type {
  ComponentAdditioanlProps,
  ComponentProps,
  MakeComponent,
} from '../component';
import { DOMNamespace } from './namespace';
import { Primitive, isObject, isPrimitive } from '../utils';
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
    P & TreeProps & ComponentAdditioanlProps,
    TemplateTreeNodeChildSettings
  >;

/**
 * функция сборки компонента, в первую очередь для jsx
 */
export type ComponentFunction<P extends ComponentProps = {}> = ((
  props: P & TreeProps & ComponentAdditioanlProps,
  children: TemplateTree
) => TemplateTreeComponent<P>) & {
  C: TreeBuilder<TemplateTreeComponent<P>>;
};

export function isTemplateTreeNode(obj: unknown): obj is TemplateTreeNode {
  if (isPrimitive(obj)) return true;

  if (typeof obj === 'function' && 'C' in obj && typeof obj.C === 'function') return true;

  if (!isObject(obj)) return false;

  if ('name' in obj && 'props' in obj && 'children' in obj && isObject(obj.props) && Array.isArray(obj.children)) {
    return true;
  }

  return false;
}

export function isElementTemplate(
  template: TemplateTree
): template is TemplateTreeElement {
  return (
    !isPrimitive(template) &&
    !Array.isArray(template) &&
    Array.isArray(template.name)
  );
}

export function isComponentTemplate(
  template: TemplateTree
): template is TemplateTreeComponent {
  return (
    !isPrimitive(template) &&
    !Array.isArray(template) &&
    typeof template.name === 'function'
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
