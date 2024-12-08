import { createComponent } from '../component';
import type { VDOMLightNode, Content } from '../model';
import { isPrimitive } from '../utils';
import { getElementFromLight } from './materializeElement';

export function getContentFromLight(light: VDOMLightNode): Content {
  if (isPrimitive(light)) return light;
  if ('get' in light) return createComponent({ light });
  return getElementFromLight(light);
}
