import { prepareTempateTree } from '../model';
import { get_children, empt, obj_keys } from '../utils';
import { runEffects } from './effects';
import {
  ComponentDiff,
  ComponentEffect,
  ComponentInternalProps,
  ComponentProps,
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
  let newProps: ComponentInternalProps<P> = { ...props };
  if (empt(checkChildren)) {
    // поменялись только свойства
    newProps = { ...(newPropsValue as any), children: get_children(props) };
  } else if (empt(checkProps)) {
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
  getPropsEffects: (name: string) => ComponentEffect[]
) {
  const propNameList = Array.from(
    new Set([...obj_keys(oldProps), ...obj_keys(newProps)])
  );
  for (const propName of propNameList) {
    const oldValue = oldProps[propName];
    const newValue = newProps[propName];
    if (oldValue !== newValue) runEffects(getPropsEffects(propName));
  }
}
