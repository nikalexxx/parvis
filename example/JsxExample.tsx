export const test = (
  <div>
    <button on:click={() => alert("+")}>+</button>
    <input
      on:change={(event) => console.log(event.currentTarget.value)}
      style="border: 1px solid red;"
    ></input>
    <a hidden={"hidden"}>ссыль</a>
  </div>
);
