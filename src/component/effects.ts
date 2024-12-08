import { ComponentEffect } from './model';

export function runEffects(effects: ComponentEffect[]): void {
  for (let effect of effects) effect();
}
