import { Component } from '../src/component/builder';
import { H } from '../src/element/builder';

export const TreeItem = Component<{tree: {}}>('TreeItem', ({ props }) => {
  return () => {
    const {tree} = props();
    return H.ul.style('padding-left: 4px')(
      ...Object.keys(tree).map(name => {
        const node = tree[name];
        return H.li(name, ': ', typeof node === 'string' ? node : TreeItem.tree(node))
      }),
    );
  }
});

