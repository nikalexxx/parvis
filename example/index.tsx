/// <reference path="./global.d.ts" />

import { render } from "parvis";
import { App } from "./App";

const destroyApp = render("#root", <App _debug/>);

render("#root2", <button on:click={destroyApp}>destroy app</button>);
