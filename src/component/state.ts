import { GetPrimitiveFromLiteral, isFunction } from '../utils';
import { runEffects } from './effects';
import { ComponentState } from './model';

export type StateUpdater<S> = S | ((prev: S) => S);

export const getNewState = <S extends ComponentState>(
  state: S,
  arg: StateUpdater<S>
): S => (isFunction(arg) ? arg(state) : arg);

export type StateClass<S> = [() => S, (newState: StateUpdater<S>) => void];

export type StateCreator = <S extends ComponentState>(
  initial: S
) => StateClass<GetPrimitiveFromLiteral<S>>;

export function getStateClass(
  rerender: () => void,
  getEffects: (setStateFn: any) => Array<() => void>,
  registrator: (stateClass: StateClass<any>) => void
): StateCreator {
  return function create<S extends ComponentState>(
    initial: S
  ): StateClass<GetPrimitiveFromLiteral<S>> {
    // состояние компонента
    let stateCurrent: GetPrimitiveFromLiteral<S> =
      initial as GetPrimitiveFromLiteral<S>;

    function setState(newState: StateUpdater<GetPrimitiveFromLiteral<S>>) {
      stateCurrent = getNewState(stateCurrent, newState);

      // перерисовка в любом случае
      rerender();

      // эффекты уже после перерисовки
      runEffects(getEffects(setState));
    }

    const stateClass: StateClass<GetPrimitiveFromLiteral<S>> = [
      () => stateCurrent,
      setState,
    ];

    registrator(stateClass);

    return stateClass;
  };
}
