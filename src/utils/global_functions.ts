export let obj_keys = Object.keys;
export let obj_assign = Object.assign;
export let obj_entries = Object.entries;
export let obj_fromEntries = Object.fromEntries;
export let console_log = console.log;
export let get_props = <T extends { props: any }>(obj: T): T['props'] =>
  obj.props;
export let get_children = <T extends { children?: any }>(
  obj: T
): T['children'] => obj.children;
