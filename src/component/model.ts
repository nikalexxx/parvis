import {
  VDOMLightElement,
  TemplateTreeElement,
  TemplateTreeNode,
  TreeProps,
  VDOMElement,
  VDOMRefDom,
  VDOMLightComponent,
  TemplateTreeComponent,
} from '../model';
import { emptySymbol } from '../utils/diff';
import { Primitive } from '../utils/type-helpers';
import { componentSymbol } from './symbols';
import { StateClass, StateCreator } from './state';

/** общий вид внутреннего состояния компонента */
export type ComponentState =
  | Primitive
  | Array<any>
  | ReadonlyArray<any>
  | Record<any, any>
  | Set<any>
  | ReadonlySet<any>
  | WeakSet<any>
  | Map<any, any>
  | ReadonlyMap<any, any>
  | WeakMap<any, any>;

/** общий вид внешних свойств компонента */
export type ComponentProps = Record<string, any>;

export type ComponentAdditioanlProps = {
  _debug?: boolean;
};

type ComponentDiff = {
  props: VDOMLightComponent['props'] | typeof emptySymbol;
  children: VDOMLightComponent['children'] | typeof emptySymbol;
  template: VDOMLightComponent['template'];
};

export type ComponentEffect = () => void;

export type ComponentEffectSetup = (effect: ComponentEffect) => void;

export type ComponentEffects = {
  mount: ComponentEffect;
  destroy: ComponentEffect;
};

export type ExternalComponentEffects = {
  append(el: Element | Text): void;
  updateLight(light: VDOMLightElement): void;
  bindElement(element: VDOMElement): void;
};

/**
 * тяжёлый инстанс компонента
 */
export type VDOMComponent<P extends ComponentProps = ComponentProps> =
  VDOMRefDom & {
    render: () => TemplateTreeElement; // получение лёгкой разметки
    name: string; // отображаемое имя компонента
    nameSymbol: symbol; // уникальный символ компонента
    instance: string; // ключ инстанса
    applyDiff(diff: ComponentDiff): void; // применение diff к существующему компоненту
    props: P; // свойства
    effects: ComponentEffects;
    externalEffects: ExternalComponentEffects;
    childComponents: VDOMComponent[]; // дочерние компоненты после материализации

    [componentSymbol]: true; // символ, однозначно позволяет определить компонент
  };

export function isComponent(e: unknown): e is VDOMComponent {
  return typeof e === 'object' && e !== null && componentSymbol in e;
}

export type ComponentInternalProps<P extends ComponentProps> = P & {
  children: TemplateTreeNode[];
} & TreeProps &
  ComponentAdditioanlProps;

export type ComponentParams<P extends ComponentProps> = {
  props: () => ComponentInternalProps<P>;
  state: StateCreator;
  hooks: {
    mount: ComponentEffectSetup;
    destroy: ComponentEffectSetup;
    effect: (effect: ComponentEffect, deps?: any[]) => void;
  };
};

/**
 * Рендер функция, определена для каждого компонента.
 *
 * разрешены только элементы
 * */
export type ComponentRender = () => VDOMLightElement;

// инициализация

/**
 * функция, которая явно возвращается из компонента при инициализации
 */
export type ComponentGetTemplate<P extends ComponentProps> = (
  props?: ComponentInternalProps<P>
) => TemplateTreeElement | TemplateTreeComponent;

/**
 * функция, описывающая поведение компонента
 */
export type MakeComponent<P extends ComponentProps = {}> = (
  params: ComponentParams<P>
) => ComponentGetTemplate<P>;

export type ComponentBindedDOMData = {
  component: VDOMComponent;
  element: VDOMElement;
  domElement: Node;
};
