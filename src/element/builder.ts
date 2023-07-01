import {
  CommonProps,
  CreateTarget,
  createTreeBuilder,
  TreeBuilder,
} from 'dot-tree-syntax';
import { HtmlElementsAttributesMap } from 'html-tag-types';

import { TemplateTreeNode, TreeProps, DOMNamespace } from '../model';

type CustomDOMAttributes<TagName, Props extends CommonProps> = {
  // _update(): boolean;
  // _replaceOnUpdate?: boolean;
  _ref: (
    e: TagName extends keyof HTMLElementTagNameMap
      ? HTMLElementTagNameMap[TagName]
      : HTMLElement
  ) => void;
  _attributes: Partial<Props>;
  _html: string;
};

export type HTML = { child: TemplateTreeNode };

type EventHandlerName<T extends string> = `on${Capitalize<T>}`;

type HtmlEvents = {
  [K in EventHandlerName<keyof HTMLElementEventMap>]: K extends `on${infer X}`
    ? Lowercase<X> extends keyof HTMLElementEventMap
      ? HTMLElementEventMap[Lowercase<X>]
      : never
    : never;
};

type HtmlEventCallbacks = {
  [Name in keyof HtmlElementsAttributesMap]: Name extends keyof HTMLElementTagNameMap
    ? {
        [K in EventHandlerName<keyof HTMLElementEventMap>]: (
          this: HTMLElementTagNameMap[Name],
          event: Omit<HtmlEvents[K], 'currentTarget'> & {
            currentTarget: HTMLElementTagNameMap[Name];
          }
        ) => void;
      }
    : never;
};

type HtmlAttributes = HtmlElementsAttributesMap;

export type HtmlTag = keyof HtmlAttributes;

export type ElementTarget<
  TagName,
  Attributes extends CommonProps
> = CreateTarget<
  [DOMNamespace, TagName],
  Attributes & CustomDOMAttributes<TagName, Attributes> & TreeProps,
  HTML
>;

export type HtmlTargets = {
  [TagName in HtmlTag]: ElementTarget<TagName, HtmlAttributes[TagName]>;
};

export type HTMLRoot = {
  [N in HtmlTag]: TreeBuilder<
    ElementTarget<N, HtmlAttributes[N] & HtmlEventCallbacks[N]>,
    { useTemplateStrings: true }
  >;
};

export const H = new Proxy({} as HTMLRoot, {
  get: (_, name) => createTreeBuilder([DOMNamespace.xhtml, name]),
});
