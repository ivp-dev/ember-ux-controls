// @ts-ignore
import layout from './template';
import { guidFor } from '@ember/object/internals';
import bem, { ClassNamesBuilder } from 'ember-ux-controls/utils/bem';
import UXElement, { IUXElementArgs } from 'ember-ux-controls/common/classes/ux-element';
import { ISplitViewContainer, SplitViewPaneModel } from 'ember-ux-controls/components/split-view/component';
import { computed } from '@ember/object';
import ItemsControl from 'dummy/classes/items-control';
import { Axes } from 'ember-ux-controls/common/types';

export interface ISplitViewPaneArgs extends IUXElementArgs {
  pane?: SplitViewPaneModel
  content?: unknown
  barSize?: number
  axis?: Axes
  isFixed?: boolean;
  hasItemsSource?: boolean
  classNamesBuilder?: ClassNamesBuilder
}

export class SplitViewPane<T extends ISplitViewPaneArgs> extends UXElement<T> implements ISplitViewContainer {
  constructor(
    owner: any,
    args: T
  ) {
    super(owner, args);
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
  public get classNames()
    : string {
    return `${bem('split-view')('pane', { '$fixed': this.isFixed, [`$${this.axis}`]: true })}`;
  }

  public get content()
    : unknown {
    return this.args.pane?.content ?? this.args.content;
  }

  public get elementId() {
    return guidFor(this)
  }

  public get isLast() {
    return (
      this.logicalParent instanceof ItemsControl &&
      this.logicalParent.items.lastObject === this.item
    )
  }
}

export default SplitViewPane.RegisterTemplate(layout);