// @ts-ignore
import layout from './template';
import { guidFor } from '@ember/object/internals';
import UXElement, { IUXElementArgs } from 'ember-ux-controls/common/classes/ux-element';
import { ISplitViewContainer, SplitViewPaneModel } from 'ember-ux-controls/components/split-view/component';
import { computed } from '@ember/object';
import { Axes } from 'ember-ux-controls/common/types';
import { reads } from '@ember/object/computed';
import { action } from '@ember/object';
import { notifyPropertyChange } from '@ember/object';

export interface ISplitViewPaneArgs extends IUXElementArgs {
  pane?: SplitViewPaneModel
  content?: unknown
  barSize?: number
  axis?: Axes
  isFixed?: boolean
  lastItem?: unknown
  hasItemsSource?: boolean
  addChild?: (child: unknown) => void
  removeChild?: (child: unknown) => void
}

export class SplitViewPane<T extends ISplitViewPaneArgs> extends UXElement<T> implements ISplitViewContainer {
  constructor(
    owner: any,
    args: T
  ) {
    super(owner, args);
  }

  @reads('args.isItemsHost')
  public isItemsHost?: boolean

  @reads('args.addChild')
  public addChild?: (child: unknown) => void

  @reads('args.removeChild')
  public removeChild?: (child: unknown) => void

  @reads('args.lastItem')
  public lastItem?: unknown

  public set item(
    value: unknown
  ) {
    if (this._item !== value) {
      this._item = value;
      notifyPropertyChange(this, 'item');
    }
  }

  public get barSize() {
    return this.args.barSize;
  }

  public get axis() {
    return this.args.axis;
  }

  public get isFixed() {
    return this.args.isFixed;
  }

  public get hasItemsSource()
    : boolean | undefined {
    return this.args.hasItemsSource
  }

  public get item() {
    return this.args.pane?.item ?? this;
  }

  @computed('isFixed', 'axis')
  public get modifers()
    : object {
    return { 
      '$fixed': this.isFixed, 
      [`$${this.axis}`]: true 
    }
  }

  public get content()
    : unknown {
    return this.args.pane?.content ?? this.args.content;
  }

  public get elementId() {
    return guidFor(this)
  }

  @action
  public didInsert() {
    debugger
    if (
      this.isItemsHost === false &&
      typeof this.addChild === 'function'
    ) {
      this.addChild(this);
    }
  }

  willDestroy() {
    super.willDestroy();

    if (
      this.isItemsHost === false &&
      typeof this.removeChild === 'function'
    ) {
      this.removeChild(this);
    }
  }

  private _item?: unknown
}

export default SplitViewPane.RegisterTemplate(layout);