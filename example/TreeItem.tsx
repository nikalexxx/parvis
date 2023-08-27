import { Component } from "parvis";

type Tree = string | { [key: string]: Tree };

export const TreeItem = Component<{ tree: Record<string, Tree> }>(
  "TreeItem",
  () => {
    return ({ tree }) => {
      return (
        <ul style="padding-left: 4px">
          {...Object.keys(tree).map((name) => {
            const node = tree[name];
            return (
              <li>
                {name}:{" "}
                {typeof node === "string" ? node : <TreeItem tree={node} />}
              </li>
            );
          })}
        </ul>
      );
    };
  }
);

