# parvis

Light framework for user interfaces.

Mini virtual DOM, rich features for components, lifecycle hooks, total typing.

```
npm install parvis
```

## Usage

### with jsx

1. Add in `tsconfig.json` settings for jsx `"jsxImportSource": "parvis"`, for example

```json
{
  "compilerOptions": {
    "target": "esnext",
    "module": "ESNext",
    "moduleResolution": "node",
    "jsx": "react-jsx",
    "jsxImportSource": "parvis" // <- here
  }
}
```

2. Add parvis jsx for your bundler, for example for `vite`

```typescript
// vite.config.ts
import { defineConfig } from "vite";

export default defineConfig({
  esbuild: {
    charset: "utf8",
    jsxImportSource: "parvis", // <- here
  },
  server: {
    port: 3000,
  },
});
```

3. Use jsx as usual (as in React or Vue) to create html elements. Use function `Component` to create components with lifecycle.

Example

`App.tsx`

```tsx
import { Component } from "parvis";

const App = Component("App", ({ hooks, state }) => {
  hooks.mount(() => {
    // hooks for lifecycle methods
    console.log("app mount");
  });

  const [start, setStart] = state(0); // function `state` create signals
  const [visible, setVisible] = state(true);
  const [text, setText] = state("");
  const [option, setOption] = state("A" as Options[number]);

  let ref: HTMLElement;

  return () => (
    <main>
      <div>
        pi = <code>{Math.PI}</code>
      </div>
      <div>
        {...Array(10)
          .fill(0)
          .map((_, i) => [
            ...(i > 0 ? [",", <br />] : []),
            <span>{Math.random()}</span>,
          ])}
      </div>
      <div>
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
      </div>
      <h2>ref</h2>
      <button
        _ref={(el) => (ref = el)}
        on:click={() => console.log("click from enter")}
      >
        ref
      </button>
      <button on:click={() => ref.focus()}>focus ref</button>
    </main>
  );
});
```

`index.tsx`

```tsx
import { render } from "parvis";
import { App } from "./App";

// for <div id="root"></div>
const destroyApp = render("#root", <App />);

// remove <App /> from <div id="root"></div>
window.destroyApp = destroyApp;
```

### without jsx

You can import html builder as constant `H`

```tsx
import { H } from "parvis";

const element = <div on:click={() => console.log("click")}>text</div>;

// is equal

const element2 = H.div.onClick(() => console.log("click"))("text");
```

You can use prop `C` for components

```tsx
import { Component } from "parvis";

const Block = Component<{ red?: boolean }>(
  "block",
  () =>
    ({ children, red }) =>
      <div style={red && "color: red"}>{children}</div>
);

const block1 = <Block red>text</Block>;

// is equal

const block2 = Block.C.red(true)("text");
```

## HTML attributes

All attributes for html tags — https://github.com/nikalexxx/html-tag-types

An agreement has been defined for event handlers: all handlers have the prefix `on:`.

Names that start with an underscore are reserved for technical properties, for example:

- `_ref` to link a virtual and real DOM.
- `_html` to insert raw html. This is dangerous because there are no sanitizers!
- `_attributes` to insert multiple attributes at once.

Some attribute names relative with updating:

- `_key` to insert node into parent by uniq key.
- `_forceUpdate` to update without conditions.
- `_skipUpdate` to freeze updating without conditions.

## Components

Each component has a name and an setup function that returns a render function.

The arguments of the setup function are props, state, and hooks.

- `props` are passed to the component from the outside.
- `state` is a generator of local states, returns a pair of getter + setter
- `hooks` describe lifecycle methods such as `mount`, `destroy`, and `effect` (effect is a subscribing to state updates)

```tsx
import { Component } from "parvis";

const Text = Component<{ size?: string }>( // type for internal props
  "text",
  // setup function
  ({ props, state, hooks }) => {
    // hooks usage
    hooks.mount(() => {
      alert("hello");
    });

    hooks.mount(() => {
      console.log("mount text");
    });
    hooks.destroy(() => {
      console.log("destroy text");
    });

    // prepare state
    const [getText, setText] = state("hello"); // initial text `hello`

    hooks.effect(() => {
      console.log("change text");
    }, [setText]);

    // handler
    const onTextClick = () => {
      // setter has old state, return new state
      setText((oldText) => `${oldText}+${oldText}`);
    };

    // render
    return ({ size, children }) => {
      // all props, internal + common (children and other)
      const text = getText(); // get local state

      return (
        <div style={`height: ${size ?? 12}px`} on:click={onTextClick}>
          {text}
          {children}
        </div>
      );
    };
  }
);
```

### Debug mode

Use `debug` function to enable debug mode

```js
debug(true);
```

After that, use prop `_debug` for component

```tsx
import { Component, render } from "parvis";

const Block = Component<{ red?: boolean }>(
  "block",
  () =>
    ({ children, red }) =>
      <div style={red && "color: red"}>{children}</div>
);

const block = (
  <Block red _debug>
    text
  </Block>
);

render("body", block);
```
