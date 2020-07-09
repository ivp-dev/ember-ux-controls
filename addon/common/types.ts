import {
  ISize
} from 'ember-ux-core/common/types';

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
  extends IHeaderedElement, IContentElement {  }