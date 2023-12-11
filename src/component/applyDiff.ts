import { prepareTempateTree } from '../model';
import { emptySymbol } from '../utils';
import { runEffects } from './effects';
import {
  ComponentDiff,
  ComponentEffect,
  ComponentInternalProps,
  ComponentProps,
  VDOMComponent,
} from './model';

export function getNewProps<P extends ComponentProps>(
  componentDiff: ComponentDiff,
  props: ComponentInternalProps<P>
) {
  // достаточно raw объекта light, так как потом компонент сам вычислит diff
  const {
    template,
    children: checkChildren,
    props: checkProps,
  } = componentDiff;
  const { children: newChildren, props: newPropsValue } = template;
  const isEmptyChildren = checkChildren === emptySymbol;
  const isEmptyProps = checkProps === emptySymbol;
  let newProps: ComponentInternalProps<P> = { ...props };
  if (isEmptyChildren) {
    // поменялись только свойства
    newProps = { ...(newPropsValue as any), children: props.children };
  } else if (isEmptyProps) {
    // поменялись только дети
    newProps.children = prepareTempateTree(newChildren);
  } else {
    newProps = {
      ...(newPropsValue as any),
      children: prepareTempateTree(newChildren),
    };
  }
  return newProps;
}

export function runPropsEffects(
  oldProps: ComponentProps,
  newProps: ComponentProps,
  getPropsEffects: (name: string) => ComponentEffect[] | null
) {
  const propNameList = Array.from(
    new Set([...Object.keys(oldProps), ...Object.keys(newProps)])
  );
  for (const propName of propNameList) {
    const oldValue = oldProps[propName];
    const newValue = newProps[propName];
    if (oldValue !== newValue) {
      const effectList = getPropsEffects(propName);
      if (effectList) runEffects(effectList);
    }
  }
}
