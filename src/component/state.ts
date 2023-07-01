import { GetPrimitiveFromLiteral } from '../utils';
import { ComponentState } from './model';

export type StateUpdater<S> = S | ((prev: S) => S);

export const getNewState = <S extends ComponentState>(
  state: S,
  arg: StateUpdater<S>
): S => (typeof arg === 'function' ? arg(state) : arg);

export type StateClass<S> = [() => S, (newState: StateUpdater<S>) => void];

export type StateCreator = <S extends ComponentState>(
  initial: S
) => StateClass<GetPrimitiveFromLiteral<S>>;

export function getStateClass(rerender: () => void, getEffects: (setStateFn: any) => Array<() => void>): StateCreator {
  return function create<S extends ComponentState>(
    initial: S
  ): StateClass<GetPrimitiveFromLiteral<S>> {
    // состояние компонента
    let stateCurrent: GetPrimitiveFromLiteral<S> =
      initial as GetPrimitiveFromLiteral<S>;

    function setState(newState: StateUpdater<GetPrimitiveFromLiteral<S>>) {
      stateCurrent = getNewState(stateCurrent, newState);

      // console.log('state/update', { stateCurrent });

      // перерисовка в любом случае
      rerender();

      // эффекты уже после перерисовки
      getEffects(setState).forEach(effect => effect());
    }

    return [() => stateCurrent, setState];
  };
}
