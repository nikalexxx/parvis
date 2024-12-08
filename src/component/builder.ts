import { createTreeBuilder } from 'dot-tree-syntax';
import { ComponentProps, MakeComponent } from './model';
import { ComponentFunction } from '../model';

export type ComponentBuildRoot = <P extends ComponentProps = {}>(
  name: string,
  make: MakeComponent<P>
) => ComponentFunction<P>;

/**
 * внешний интерфейс компонента
 *
 * @example
 * ```tsx
 * const RandomButton = Component('RandomButton', () => () => <button>{Math.random()}</button>);
 *
 * const RandomList = Component<{count: number}>('RandomList', ({props}) => ()
 *   => <div>{Array.from({length: props().count}).map(() => <RandomButton/>)}</div>
 * ```
 */
export const Component: ComponentBuildRoot = (name, make) => {
  (make as any).displayName = name; // имя в основном для отладки
  const getComponent: ComponentFunction = (props, children) => ({
    name: make as any,
    props,
    children: children as any,
  });
  getComponent.C = createTreeBuilder(make) as any;

  return getComponent as any;
};
