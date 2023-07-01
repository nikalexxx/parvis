# parvis

light framework for user interfaces

```
npm install parvis
```

## Usage
```typescript

// App.ts
import {Component, H} from 'parvis';

const App = Component('App', ({ hooks, state }) => {
  hooks.mount(() => {
    console.log('app mount');
  });

  const [start, setStart] = state(0);
  const [visible, setVisible] = state(true);
  const [text, setText] = state('');
  const [option, setOption] = state('A' as Options[number]);

  let ref: HTMLElement;

  const setRefFocus = () => {
    ref.focus();
  };

  return () =>
    H.main(
      H.div(H.h2`hello, world`, 'test'),
      H.div(
        H.button.onClick(() => setVisible((x) => !x))(
          visible() ? 'hide counter' : 'show counter'
        ),
        visible() &&
          H.article(
            H.div(
              H.button.onClick(() => setStart((x) => x + 1))`+ start`,
              H.br,
              H.button.onClick(() => setStart((x) => x - 1))`- start`
            ),
            H.div(start())
          )
      ),
      H.div`only string pi = ${H.code(Math.PI)}`,
      H.div(
        ...Array(10)
          .fill(0)
          .map((_, i) => [
            ...(i > 0 ? [',', H.br()] : []),
            H.span(Math.random()),
          ])
      ),
      H.div(
        H.h2('interactive'),
        H.input.value(text()).onInput((e) => setText(e.currentTarget.value)),
        H.button.onClick(() =>
          setText((x) => x.split('').reverse().join(''))
        )`reverse`,
        H.p(H.pre(text())),
        H.hr,
        H.textarea.onInput((e) => setText(e.currentTarget.value))(text()),
        H.hr,
        H.select(
          ...options.map((value) =>
            H.option
              .selected(value === option())
              .onClick(() => setOption(value))(value)
          )
        ),
        H.button.onClick(() =>
          setOption(options[Math.trunc(Math.random() * 3)])
        )`random`,
        H.pre(option()),
        H.hr,
        H.button.onDblclick(() => console.log('double click'))`double click`
      ),
      H.div(
        H.h2`ref`,
        H.button
          ._ref((el) => {
            ref = el;
          })
          .onClick(() => console.log('click from enter'))`ref`,
        H.button.onClick(() => {
          ref.focus();
        })`focus ref`
      )
    );
});

// index.ts
import {render} from 'parvis';
import {App} from './App';

// for <div id="root"></div>
render('#root', App());

```
