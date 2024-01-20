import { Component, H, debug, printTree } from "parvis";
import { Counter } from "./Counter";
import { TreeItem } from "./TreeItem";

import css from "./App.module.css";

debug(true);

export const RedBox = Component<{ className?: string }>("RedBox", () => {
  return ({ className, children }) => {
    return <div class={[css.redbox, className]}>{children}</div>;
  };
});

const options = ["A", "B", "C"] as const;
type Options = typeof options;

export const App = Component("App", ({ hooks, state }) => {
  hooks.mount(() => {
    console.log("app mount");
  });

  const [start, setStart] = state(0);
  const [visible, setVisible] = state(true);
  const [text, setText] = state("");
  const [option, setOption] = state("A" as Options[number]);

  let ref: HTMLElement;
  const focusRef = () => ref.focus();

  return () => (
    <main class={css.app}>
      {RedBox.C(H.h2(`hello, world`), "test")}
      <RedBox>
        <button on:click={() => setVisible((x) => !x)}>
          {visible() ? "hide counter" : "show counter"}
        </button>
        {visible() && (
          <article>
            <div>
              <button on:click={() => setStart((x) => x + 1)}>+ start</button>
              <br />
              <button on:click={() => setStart((x) => x - 1)}>- start</button>
            </div>
            <Counter start={start()} />
          </article>
        )}
      </RedBox>
      <RedBox>
        <TreeItem tree={{ a: { b: { c: "1", d: { e: "2", e2: "3" } } } }} />
      </RedBox>
      <RedBox>
        pi = <code>{Math.PI}</code>
      </RedBox>
      <RedBox>
        {...Array(10)
          .fill(0)
          .map((_, i) => [
            ...(i > 0 ? [",", <br />] : []),
            <span>{Math.random()}</span>,
          ])}
      </RedBox>
      <RedBox>
        <h2>interactive</h2>
        <input
          value={text()}
          on:input={(e) => setText(e.currentTarget.value)}
        />
        <button on:click={() => setText((x) => x.split("").reverse().join(""))}>
          reverse
        </button>
        <p>
          <pre>{text()}</pre>
        </p>
        <hr />
        <textarea on:input={(e) => setText(e.currentTarget.value)}>
          {text()}
        </textarea>
        <hr />
        <select>
          {...options.map((value) => (
            <option
              selected={value === option()}
              on:click={() => setOption(value)}
            >
              {value}
            </option>
          ))}
        </select>
        <button
          on:click={() => setOption(options[Math.trunc(Math.random() * 3)])}
        >
          random
        </button>
        <pre>{option()}</pre>
        <hr />
        <button on:dblclick={() => console.log("double click")}>
          double click
        </button>
      </RedBox>
      <RedBox>
        <h2>ref</h2>
        <button
          class={css.ref}
          _ref={(el) => (ref = el)}
          on:click={() => console.log("click from enter")}
        >
          ref
        </button>
        <button on:click={focusRef}>focus ref</button>
      </RedBox>
    </main>
  );
});

console.log(
  printTree(
    <article>
      <div>
        <button on:click={() => (x) => x + 1}>+ start</button>
        <br />
        <button on:click={() => (x) => x - 1}>- start</button>
      </div>
      <Counter start={1} />
    </article>
  )
);
