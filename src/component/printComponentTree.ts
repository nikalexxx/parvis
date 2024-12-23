import { console_log, obj_keys } from '../utils';
import { VDOMComponent } from './model';

const space = (n: number) => Array(n).fill(' ').join('');

export function printComponentTree(
  component: VDOMComponent,
  level = 0
): string {
  // console.group(component.name);
  const { children, ...otherProps } = component.props;
  if (obj_keys(otherProps).length > 0) {
    // console_log(otherProps);
  }
  const list = [space(level) + component.name];
  component.childComponents.forEach((x) =>
    list.push(printComponentTree(x, level + 1))
  );
  // console.groupEnd();
  return list.join('\n');
}
