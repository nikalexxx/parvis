import { ComponentEffect } from './model';

export function runEffects(effects: ComponentEffect[]): void {
  for (const effect of effects) effect();
}
