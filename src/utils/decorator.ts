export function decorator(
  body: (action: () => void, targetF: Function) => void
) {
  return <T extends (...args: any[]) => any>(f: T) =>
    function (...args: any[]) {
      let result: any;
      body(() => {
        result = f(...args);
      }, f);
      return result;
    } as T;
}
