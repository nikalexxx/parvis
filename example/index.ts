import { render } from '../src';
import { App, RedBox } from './App';
import { Counter } from './Counter';

render('#root', App());

render('#root2', RedBox(Counter.start(1)));
