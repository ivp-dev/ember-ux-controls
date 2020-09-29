// @ts-ignore
import layout from './template';
import { guidFor } from '@ember/object/internals';
import bem, { ClassNamesBuilder } from 'ember-ux-controls/utils/bem';
import UXElement, { IUXElementArgs } from 'ember-ux-controls/common/classes/ux-element';
import { PaneModel } from 'ember-ux-controls/components/split-view/component';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';

export interface ISplitViewPaneArgs extends IUXElementArgs {
  pane?: PaneModel
  content?: unknown
  isFixed?: boolean;
  hasItemsSource?: boolean
  classNamesBuilder?: ClassNamesBuilder
}

export class SplitViewPane<T extends ISplitViewPaneArgs> extends UXElement<T> {
  constructor(
    owner: any,
    args: T
  ) {
    super(owner, args);
  }

  @reads('args.isFixed') 
  public isFixed: boolean = false

  public get hasItemsSource()
    : boolean | undefined {
    return this.args.hasItemsSource
  }

  @computed('isFixed')
  public get classNames()
    : string {
    return `${bem('split-view')('pane', { '$fixed': this.isFixed })}`;
  }

  public get content()
    : unknown {
    return this.args.pane?.content ?? this.args.content;
  }

  public get elementId() {
    return guidFor(this)
  }
}

export default SplitViewPane.RegisterTemplate(layout);