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
  axis?: Axes
  pane?: SplitViewPaneModel
  content?: unknown
  barSize?: number
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

  @reads('args.hasItemsSource')
  public hasItemsSource?: boolean

  @reads('args.addChild')
  public addChild?: (child: unknown) => void

  @reads('args.removeChild')
  public removeChild?: (child: unknown) => void

  @reads('args.lastItem')
  public lastItem?: unknown

  @reads('args.barSize')
  public barSize?: number

  @reads('args.axis')
  public axis?: Axes

  @reads('args.isFixed')
  public isFixed?: boolean

  public get item() {
    return this.args.pane?.item ?? this;
  }

  public set item(
    value: unknown
  ) {
    if (this._item !== value) {
      this._item = value;
      notifyPropertyChange(this, 'item');
    }
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
    if (
      this.hasItemsSource === false &&
      typeof this.addChild === 'function'
    ) {
      this.addChild(this);
    }
  }

  willDestroy() {
    super.willDestroy();

    if (
      this.hasItemsSource === false &&
      typeof this.removeChild === 'function'
    ) {
      this.removeChild(this);
    }
  }

  private _item?: unknown
}

export default SplitViewPane.RegisterTemplate(layout);