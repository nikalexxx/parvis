/// <reference path="./global.d.ts" />

import { render } from "parvis";
import { App, RedBox } from "./App";
import { Counter } from "./Counter";

const destroyApp = render("#root", <App _debug={true} />);

render(
  "#root2",
  <div>
    {RedBox.C(Counter.C.start(1))}
    <button on:click={destroyApp}>destroy app</button>
  </div>
);
