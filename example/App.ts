import { Component } from '../src';
import { H } from '../src/element/builder';
import { Counter } from './Counter';
import { TreeItem } from './TreeItem';

import css from './App.module.css';

export const RedBox = Component('RedBox', ({ props }) => {
  return () => {
    return H.div.class(css.redbox)(...props().children);
  };
});

const options = ['A', 'B', 'C'] as const;
type Options = typeof options;

export const App = Component('App', ({ hooks, state }) => {
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
    H.main.class(css.app)(
      RedBox(H.h2`hello, world`, 'test'),
      RedBox(
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
            Counter.start(start())
          )
      ),
      RedBox(TreeItem.tree({ a: { b: { c: '1', d: { e: '2' } } } })),
      RedBox`only string pi = ${H.code(Math.PI)}`,
      RedBox(
        ...Array(10)
          .fill(0)
          .map((_, i) => [
            ...(i > 0 ? [',', H.br()] : []),
            H.span(Math.random()),
          ])
      ),
      RedBox(
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
      RedBox(
        H.h2`ref`,
        H.button
          .class(css.ref)
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
