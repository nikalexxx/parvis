import { H } from '../element/builder';
import { Component } from './builder';

const Test = Component<{ color: string }>('Test', ({ props, state, hooks }) => {
    const [count, setCount] = state(0);
    const inc = () => setCount((c) => c + 1);

    hooks.mount(() => {
        console.log('test mount!');
    });

    hooks.destroy(() => {
        console.log('test destroy!');
    });

    return () =>
        H.div.style(`color: ${props().color}`)(
            H.div(count()),
            H.div.onClick(inc)('+')
        );
});

console.log(Test.color('red')());
console.log(Test.color('green')());
