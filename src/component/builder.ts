import { createTreeBuilder, TreeBuilder } from 'dot-tree-syntax';
import { ComponentProps, MakeComponent } from './model';
import { TemplateTreeComponent } from '../model';

export type ComponentBuildRoot = <P extends ComponentProps>(
  name: string,
  make: MakeComponent<P>
) => TreeBuilder<TemplateTreeComponent<P>, { useTemplateStrings: true }>;

/**
 * внешний интерфейс компонента
 *
 * @example
 * ```ts
 * const RandomButton = Component('RandomButton', () => () => H.button(Math.random()));
 *
 * const RandomList = Component('RandomList', ({props}) => ()
 *   => E.div((new Array(props.count)).map(() => RandomButton)))
 * ```
 */
export const Component: ComponentBuildRoot = (name, make) => {
  (make as any).displayName = name; // имя в основном для отладки
  return createTreeBuilder(make as any);
};
