import { isBuildFunction } from 'dot-tree-syntax';

import {
  TemplateTreeNode,
  TemplateTreeElement,
  TemplateTreeComponent,
  prepareTempateTree,
  VDOMLightNode,
} from '../model';
import { isPrimitive } from '../utils';
import { createVdomLightComponent } from './component';
import { createLightElement } from './element';

export function createLightNode(rawNode: TemplateTreeNode): VDOMLightNode {
  if (isPrimitive(rawNode)) return rawNode;
  let node = rawNode;
  if (isBuildFunction(rawNode)) node = rawNode();

  // console.log('light', {node, rawNode, isBuild: node !== rawNode});

  if (Array.isArray(node.name))
    return createLightElement(node as TemplateTreeElement);
  return createVdomLightComponent(node as TemplateTreeComponent);
}

export function prepareNode(node: TemplateTreeNode): VDOMLightNode {
  return isPrimitive(node) ? node : createLightNode(node);
}

export function prepareChildren(children: TemplateTreeNode[]): VDOMLightNode[] {
  return prepareTempateTree(children).map(prepareNode);
}
