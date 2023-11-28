import { HtmlElementProps, HtmlTargets } from '../element/builder';
import {
  ComponentFunction,
  TemplateTreeComponent,
  TemplateTreeElement,
  TemplateTreeNode,
} from '../model';
import '../global';

declare global {
  namespace JSX {
    type Tag = keyof HtmlTargets;

    type ElementType = Tag | ComponentFunction;

    type Element = TemplateTreeElement | TemplateTreeComponent;

    type IntrinsicElements = {
      [TagName in Tag]: Partial<HtmlElementProps<TagName, true>>;
    };
  }
}

export function jsx(
  tag: JSX.ElementType,
  props: Record<string, any> = {}
): TemplateTreeNode {
  const { children } = props;
  const childList = children ? (Array.isArray(children) ? children : [children]) : [];
  delete props.children;
  if (typeof tag === 'string') {
    return {
      name: ['xhtml', tag] as any,
      props,
      children: childList,
    };
  }

  return tag(props, childList);
}

export const jsxDev = jsx;
export const jsxDEV = jsx;
export const jsxs = jsx;

export function Fragment(props: any, children: any[]) {
  return children;
}
