import type { VDOMLightNode, Content } from '../model';
import { isPrimitive } from '../utils';
import { getComponentFromLight } from './materializeComponent';
import { getElementFromLight } from './materializeElement';

export function getContentFromLight(light: VDOMLightNode): Content {
    if (isPrimitive(light)) return light;
    if ('get' in light) return getComponentFromLight(light);
    return getElementFromLight(light);
}
