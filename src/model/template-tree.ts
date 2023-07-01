import { CommonProps, CreateTarget } from 'dot-tree-syntax';

import type { ComponentProps, MakeComponent } from '../component';
import { DOMNamespace } from './namespace';
import { Primitive, isPrimitive } from '../utils';

/**
 * все возможные типы верстки
 */
export type TemplateTreeNode =
    | Primitive
    | TemplateTreeElement
    | TemplateTreeComponent;

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
export type TemplateTreeComponent<P extends ComponentProps = any> = CreateTarget<
    MakeComponent<P> & {displayName: string},
    P,
    TemplateTreeNodeChildSettings
>;

export function isComponentTemplate(template: TemplateTreeNode): template is TemplateTreeComponent {
  return !isPrimitive(template) && typeof template.name === 'function';
}

export function filterTemplateTreeNode(node: TemplateTreeNode): boolean {
  return node !== null && node !== undefined && node !== false;
}


// на самом деле массивы сколь угодно вложенны
export function prepareTempateTree(templateTree: TemplateTree[]): TemplateTreeNode[] {
  return (templateTree as any).flat(Infinity).filter(filterTemplateTreeNode);

}
