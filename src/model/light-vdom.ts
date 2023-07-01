import type { ComponentProps, MakeComponent } from '../component';
import { DOMNamespace } from './namespace';
import { Primitive } from '../utils';
import { TemplateTreeComponent } from './template-tree';
import { TreeProps } from './tree-props';
import { Tags } from './vdom-model';

/**
 * легковесная dom нода
 */
export type VDOMLightNode = VDOMLightComponent | VDOMLightElement | Primitive;

export type VDOMLightProps = Record<string, any> & TreeProps;
/**
 * легковесный контейнер общего типа
 */
export type VDOMLightCommonNode = {
  children?: VDOMLightNode[];
  props?: VDOMLightProps;
};

/**
 * легковесный контейнер для компонента
 */
export type VDOMLightComponent<P extends ComponentProps = ComponentProps> =
  VDOMLightCommonNode & {
    get: MakeComponent<P>;
    name?: string;
    template: TemplateTreeComponent<P>;
  };

/**
 * легковесный контейнер для элемента
 */
export type VDOMLightElement<N extends DOMNamespace = DOMNamespace> =
  VDOMLightCommonNode & {
    namespace: N;
    tagName: Tags[N];
  };
