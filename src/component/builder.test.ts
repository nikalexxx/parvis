import { H } from '../element/builder';
import { console_log } from '../utils';
import { Component } from './builder';

const Test = Component<{ color: string }>('Test', ({ props, state, hooks }) => {
  const [count, setCount] = state(0);
  const inc = () => setCount((c) => c + 1);

  hooks.mount(() => {
    console_log('test mount!');
  });

  hooks.destroy(() => {
    console_log('test destroy!');
  });

  return () =>
    H.div.style(`color: ${props().color}`)(
      H.div(count()),
      H.div.onClick(inc)('+')
    );
});

console_log(Test.C.color('red')());
console_log(Test.C.color('green')());
