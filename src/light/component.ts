import type { ComponentProps } from '../component';
import type { VDOMLightComponent, TemplateTreeComponent } from '../model';
import { console_log, obj_keys } from '../utils';
import { prepareChildren } from './light';

export function createVdomLightComponent<P extends ComponentProps>(
  template: TemplateTreeComponent<P>
): VDOMLightComponent<P> {
  const { name, props, children } = template;
  const light: VDOMLightComponent<P> = {
    get: name,
    name: name.displayName ?? name.name,
    template,
  };

  if (obj_keys(props).length > 0) light.props = props;

  // console_log('component', {children, template});

  if (children.length > 0) light.children = prepareChildren(children as any);

  return light;
}
