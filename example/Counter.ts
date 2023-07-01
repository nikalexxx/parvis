import { Component } from '../src/component/builder';
import { H } from '../src/element/builder';

export const Counter = Component<{ start: number }>(
  'Counter',
  ({ props, state, hooks }) => {
    const [getCount, setCount] = state(0);
    const inc = () => setCount((x) => x + 1);
    const dec = () => setCount((x) => x - 1);
    const getResult = () => props().start + getCount();

    hooks.mount(() => {
      console.log('Counter/mount');
    });

    hooks.destroy(() => {
      console.log('Counter/destroy');
    });

    hooks.destroy(() => {
      console.log('Counter/destroy 2');
    });

    hooks.effect(() => {
      console.log('setCount call');
      console.log('count = ', getCount());
    }, [setCount]);

    return () => {
      const count = getCount();
      const { start } = props();
      const result = getResult();
      return H.div(
        `count: ${count}`,
        H.button.onClick(inc)('+'),
        H.button.onClick(dec)('-'),
        H.div(`start: ${start}`),
        H.div(`result = ${start} + ${count} = ${result}`),
        result > 0 && H.div(`result > 0`)
      );
    };
  }
);
