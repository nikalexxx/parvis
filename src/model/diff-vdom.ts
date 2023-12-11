import {
  diff,
  Diff,
  diffArray,
  DiffByKeys,
  emptySymbol,
  raw,
  isPrimitive,
} from '../utils';
import {
  VDOMLightComponent,
  VDOMLightElement,
  VDOMLightNode,
} from './light-vdom';

export type DiffVDOMLight = Diff<VDOMLightNode, VDOMLightNode>;

export function diffVdomLight(
  A: VDOMLightNode,
  B: VDOMLightNode
): Diff<VDOMLightNode, VDOMLightNode> {
  if (isPrimitive(A) || isPrimitive(B)) return diff(A, B);

  // явное обновление
  if (B.props?._forceUpdate) return raw(B);

  // явное запрещение обновления
  if (B.props?._skipUpdate) return emptySymbol;

  if ('get' in B) {
    // компонент заменил дерево
    if (!('get' in A)) return raw(B);

    // новый компонент
    if (A.get !== B.get) return raw(B);

    // сравниваем одинаковые компоненты
    const diffProps = diff(A.props, B.props);
    const diffChildren = diffArray(
      A.children ?? [],
      B.children ?? [],
      diffVdomLight
    );

    const isEmptyDiffProps = diffProps === emptySymbol;
    const isEmptyDiffChildren = diffChildren === emptySymbol;

    // пропускаем, если ничего не изменилось
    if (isEmptyDiffChildren && isEmptyDiffProps) return emptySymbol;

    // если изменения были, выбираем новые значения, так как они нам нужны в компоненте, а не diff
    const componentDiff: Diff<VDOMLightComponent, VDOMLightComponent> = {
      ...B,
    } as Diff<VDOMLightComponent, VDOMLightComponent>;
    (componentDiff as any).props = isEmptyDiffProps
      ? emptySymbol
      : raw(B.props);
    (componentDiff as any).children = isEmptyDiffChildren
      ? emptySymbol
      : raw(B.children ?? []);
    (componentDiff as any).get = emptySymbol;
    (componentDiff as any).name = emptySymbol;

    // для сравнения внутри компонента
    (componentDiff as any).template = raw(B.template);
    return componentDiff;
  }

  // B - дерево, заменило компонент A
  if ('get' in A) return raw(B);

  // далее A и B элементы

  if (A.namespace !== B.namespace) return raw(B);
  if (A.tagName !== B.tagName) return raw(B);

  const diffElementProps = diff(A.props ?? {}, B.props ?? {});
  const diffElementChildren = diffArray(
    A.children ?? [],
    B.children ?? [],
    diffVdomLight
  );

  if (diffElementProps === emptySymbol && diffElementChildren === emptySymbol)
    return emptySymbol;

  const fDiff: DiffByKeys<VDOMLightElement, VDOMLightElement> = {
    props: diffElementProps,
    children: diffElementChildren,
    tagName: emptySymbol,
    namespace: emptySymbol,
  };

  return fDiff;
}
