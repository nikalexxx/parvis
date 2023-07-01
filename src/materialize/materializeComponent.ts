import { VDOMLightComponent } from '../model';
import { createComponent, VDOMComponent } from '../component';

/**
 * создание компонента из его облегчённой версии
 */
export function getComponentFromLight(
  light: VDOMLightComponent
): VDOMComponent {

  const component = createComponent({ light });

  return component;
}
