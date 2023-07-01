import { decorator } from "./decorator";

export const log = (name: string) => decorator((action, f) => {
  console.group(name);
  console.log(f.toString())
  action();
  console.groupEnd();
  console.log('next')
})
