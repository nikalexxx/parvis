import { Component } from "parvis";

interface Props {
  start: number;
}

export const Counter = Component<Props>(
  "Counter",
  ({ props, state, hooks }) => {
    const [getCount, setCount] = state(0);
    const inc = () => setCount((x) => x + 1);
    const dec = () => setCount((x) => x - 1);
    const getResult = () => props().start + getCount();

    hooks.mount(() => {
      console.log("Counter/mount");
    });

    hooks.destroy(() => {
      console.log("Counter/destroy");
    });

    hooks.destroy(() => {
      console.log("Counter/destroy 2");
    });

    hooks.effect(() => {
      console.log("setCount call");
      console.log("count = ", getCount());
    }, [setCount]);

    hooks.effect(() => {
      console.log("props changed");
      console.log("start = ", props.start());
    }, [props.start]);

    return ({ start }) => {
      const count = getCount();
      // const { start } = props();
      const result = getResult();
      return (
        <div>
          count: {count}
          <button on:click={inc}>+</button>
          <button on:click={dec}>-</button>
          <div>start: {start}</div>
          <div>
            result = {start} + {count} = {result}
          </div>
          {result > 0 && <div>result {">"} 0</div>}
        </div>
      );
    };
  }
);
