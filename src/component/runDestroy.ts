import { elementSymbol } from '../symbols';
import { findParentComponent } from './findParentComponent';
import { VDOMComponent } from './model';

function runDestroyHooks(component: VDOMComponent): void {
  component.childComponents.forEach(runDestroyHooks);
  component.effects.destroy();
}

function checkComponentScope(
  component: VDOMComponent,
  targetNode: Node,
  root: Node
): boolean {
  let domNode: Node | null = component.dom.ref ?? null;
  if (!domNode) return false;
  while (domNode !== null && domNode !== root) {
    if (domNode === targetNode) return true;
    domNode = domNode.parentNode;
  }
  return false;
}

export function runDestroy(node: Node): void {
  const element = node[elementSymbol];
  if (!element) return;

  const component = element.component;
  if (component) {
    // попали точно в компонент
    runDestroyHooks(component);
    return;
  }

  // ищем ближайшего родителя
  const data = findParentComponent(node);
  if (!data) return;
  data.component.childComponents.forEach((childComponent) => {
    // проверяем что дочерние компоненты внутри текущей ноды
    if (checkComponentScope(childComponent, node, data.domElement)) {
      // если внутри, то запускаем хуки удаления
      runDestroyHooks(childComponent);
    }
  });
}
