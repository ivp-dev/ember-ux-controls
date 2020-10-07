import EmberArray from '@ember/array';
import ItemCollection from 'ember-ux-controls/common/classes/-private/item-collection';

export const Axes = {
  X: 'x' as 'x',
  Y: 'y' as 'y'
};

export type Axes = typeof Axes[keyof typeof Axes];

export const Size = {
  Width: "width" as "width",
  Height: "height" as "height"
}

export type Size = typeof Size[keyof typeof Size];

export const Side = {
  Left: "left" as "left",
  Right: "right" as "right",
  Top: "top" as "top",
  Bottom: "bottom" as "bottom"
}

export type Side = typeof Side[keyof typeof Side];

export const Direction = {
  Forward: 'forward' as 'forward',
  Backward: 'backward' as 'backward'
}

export type Direction = typeof Direction[keyof typeof Direction];

export interface ISize {
  width: number;
  height: number;
}

export const DeferredAction = {
  Push: 'push' as 'push',
  Remove: 'remove' as 'remove'
}

export type DeferredAction = typeof DeferredAction[keyof typeof DeferredAction]

export interface IPointer {
  position: number
  offset: number
}

export interface IPointerCoordinates {
  pageY: number,
  pageX: number,
  clientX: number,
  clientY: number,
  offsetX: number,
  offsetY: number
}

export const GeneratorDirection = Direction

export type GeneratorDirection = typeof GeneratorDirection[keyof typeof GeneratorDirection]

export interface IEquatable {
  equals: (other: any) => boolean
}

export interface IArrayObserverArgs<T> {
  items: EmberArray<T>,
  offset: number,
  removeCount: number,
  addCount: number
}

export interface IArrayObserver<T> {
  didChange: CollectionChangedCallback<T>
  willChange: CollectionChangedCallback<T>
}

export interface ISyncProxyArray<T> extends IArrayObserver<T> {
  syncArray: EmberArray<object> | null
}

export interface IDisposable {
  dispose: () => void
}

export interface IGeneratorHost {
  view: ItemCollection
  containerForItem: (item: unknown) => any
  itemItsOwnContainer: (item: unknown) => boolean
  createContainerForItem: (item: unknown) => any
  clearContainerForItem: (container: object, item: unknown) => void
  linkContainerToItem: (container: object, item: unknown) => void
  prepareItemContainer: (container: object) => void
  readItemFromContainer: (container: object) => unknown
}

export interface IDeferredReference<T> {
  getValue: () => T
}

export interface ISelectable {
  isSelected: boolean
}

export interface IModifierArgs<N = unknown> {
  /** Positional arguments to a modifier, `{{foo @bar this.baz}}` */
  positional: unknown[];
  /** Named arguments to a modifier, `{{foo bar=this.baz}}` */
  named: Record<string, N>;
}

export const ItemCollectionActions = {
  Add: 'add' as 'add',
  Remove: 'remove' as 'remove',
  Reset: 'reset' as 'reset',
  Replace: 'replace' as 'replace'
};

export type ItemCollectionActions = typeof ItemCollectionActions[keyof typeof ItemCollectionActions];

export type CollectionChangedCallback<TItem> = (
  items: EmberArray<TItem>,
  offset: number,
  removeCount: number,
  addCount: number
) => void

export const GeneratorStatus = {
  NotStarted: 'notStarted' as 'notStarted',
  GeneratingContainers: 'generatingContainers' as 'generatingContainers',
  ContainersGenerated: 'containersGenerated' as 'containersGenerated',
  Error: 'error' as 'error'
};

export type GeneratorStatus = typeof GeneratorStatus[keyof typeof GeneratorStatus];

export type CompareCallback = (left: any, right: any) => boolean

export interface IOffset {
  left: number,
  top: number
}

export interface IDimensions {
  portOffset: IOffset
  contentSize: ISize
  screenSize: ISize
  isX: boolean;
  isY: boolean
  ratioX: number
  ratioY: number
  barSizeX: number
  barSizeY: number
  maxScrollX: number
  maxScrollY: number
  scrollX: number
  scrollY: number
}

export interface IHeaderedElement {
  header: unknown
}

export interface IItemsElement {
  items: unknown[]
}

export interface IContentElement {
  content: unknown
}

export interface IHeaderContentElement
  extends IHeaderedElement, IContentElement {
}

export interface IEventArgs {
  readonly canceled: boolean,
  readonly stopped: boolean,
  cancel(): void
  stopPropagation(): void
}

export type EventArgs<T extends IEventArgs> = {
  new(...args: any[]): T
} 

export interface IEventEmmiter {
  hasListeners: boolean
  
  emitEvent<T extends IEventArgs>(
    sender: object,
    event: EventArgs<T>,
    ...args: any[]
  ): T

  addEventListener<T extends IEventArgs>(
    context: object,
    key: EventArgs<T>,
    callback: (sender: object, args: IEventArgs) => void
  ): void

  removeEventListener<T extends IEventArgs>(
    context: object,
    key: EventArgs<T>,
    callback: (sender: object, args: IEventArgs) => void
  ): void

  clearEventListeners(): void
}
