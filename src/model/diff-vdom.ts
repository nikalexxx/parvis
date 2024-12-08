import {
  diff,
  Diff,
  diffArray,
  DiffByKeys,
  emptyS,
  raw,
  isPrimitive,
  get_children,
  empt,
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
  if (B.props?._skipUpdate) return emptyS;

  if ('get' in B) {
    // компонент заменил дерево
    if (!('get' in A)) return raw(B);

    // новый компонент
    if (A.get !== B.get) return raw(B);

    // сравниваем одинаковые компоненты
    const diffProps = diff(A.props, B.props);
    const diffChildren = diffArray(
      get_children(A) ?? [],
      get_children(B) ?? [],
      diffVdomLight
    );

    const isEmptyDiffProps = empt(diffProps);
    const isEmptyDiffChildren = empt(diffChildren);

    // пропускаем, если ничего не изменилось
    if (isEmptyDiffChildren && isEmptyDiffProps) return emptyS;

    // если изменения были, выбираем новые значения, так как они нам нужны в компоненте, а не diff
    const componentDiff: Diff<VDOMLightComponent, VDOMLightComponent> = {
      ...B,
    } as Diff<VDOMLightComponent, VDOMLightComponent>;
    (componentDiff as any).props = isEmptyDiffProps ? emptyS : raw(B.props);
    (componentDiff as any).children = isEmptyDiffChildren
      ? emptyS
      : raw(get_children(B) ?? []);
    (componentDiff as any).get = emptyS;
    (componentDiff as any).name = emptyS;

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
    get_children(A) ?? [],
    get_children(B) ?? [],
    diffVdomLight
  );

  if (empt(diffElementProps) && empt(diffElementChildren)) return emptyS;

  const fDiff: DiffByKeys<VDOMLightElement, VDOMLightElement> = {
    props: diffElementProps,
    children: diffElementChildren,
    tagName: emptyS,
    namespace: emptyS,
  };

  return fDiff;
}
