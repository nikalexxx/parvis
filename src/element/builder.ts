import {
  CommonProps,
  CreateTarget,
  createTreeBuilder,
  TreeBuilder,
} from 'dot-tree-syntax';
import { HtmlElementsAttributesMap } from 'html-tag-types';

import { TemplateTreeNode, TreeProps, DOMNamespace } from '../model';

type Attribute<T> = T extends string[] ? T | string : T;

type HtmlAttributes = {
  [K in keyof HtmlElementsAttributesMap]: {
    [Name in keyof HtmlElementsAttributesMap[K]]: Attribute<HtmlElementsAttributesMap[K][Name]>;
  };
}
export type HtmlTag = keyof HtmlAttributes;


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

type EventName = keyof HTMLElementEventMap;

type EventHandlerName<T extends string> = `on${Capitalize<T>}`;
type GetEventNameFromHandler<T extends string> = T extends `on${infer X}`
  ? Lowercase<X>
  : T;

type EventHandlerJXSName<T extends string> = `on:${T}`;
type GetEventNameFromJSXHandler<T extends string> = T extends `on:${infer X}`
  ? X
  : T;

type GetEventHandlerNames<useNamespace = false> = useNamespace extends true
  ? EventHandlerJXSName<EventName>
  : EventHandlerName<EventName>;

type GetEventNameFromHandlerImpl<T extends string, useNamespace = false> = (
  useNamespace extends true
    ? GetEventNameFromJSXHandler<T>
    : GetEventNameFromHandler<T>
) extends infer X extends EventName
  ? X
  : never;

type HtmlEventCallbacks<useNamespace = false> = {
  [Name in keyof HtmlAttributes]: Name extends keyof HTMLElementTagNameMap
    ? {
        [K in GetEventHandlerNames<useNamespace>]: (
          this: HTMLElementTagNameMap[Name],
          event: Omit<
            HTMLElementEventMap[GetEventNameFromHandlerImpl<K, useNamespace>],
            'currentTarget'
          > & {
            currentTarget: HTMLElementTagNameMap[Name];
          }
        ) => void;
      }
    : never;
};



export type ElementTarget<
  TagName,
  Attributes extends CommonProps
> = CreateTarget<
  [DOMNamespace, TagName],
  Attributes & CustomDOMAttributes<TagName, Attributes> & TreeProps,
  HTML
>;

export type HtmlElementRawProps<
  T extends HtmlTag,
  useNamespace = false
> = HtmlAttributes[T] & HtmlEventCallbacks<useNamespace>[T];

export type HtmlElementProps<
  T extends HtmlTag,
  useNamespace = false
> = HtmlElementRawProps<T, useNamespace> &
  TreeProps &
  CustomDOMAttributes<T, HtmlElementRawProps<T, useNamespace>>;

export type HtmlElementTarget<T extends HtmlTag> = ElementTarget<
  T,
  HtmlElementProps<T>
>;

export type HtmlTargets = {
  [TagName in HtmlTag]: HtmlElementTarget<TagName>;
};

export type HTMLRoot = {
  [TagName in HtmlTag]: TreeBuilder<
    HtmlElementTarget<TagName>
    // { useTemplateStrings: true }
  >;
};

export const H = new Proxy({} as HTMLRoot, {
  get: (_, name) => createTreeBuilder(['xhtml', name]),
});
