import { guidFor } from '@ember/object/internals';
import { ClassNamesBuilder } from 'ember-ux-controls/utils/bem';
import UXElement, { IUXElementArgs } from 'ember-ux-controls/common/classes/ux-element';
import { PaneModel } from 'ember-ux-controls/components/split-view/component';

// @ts-ignore
import layout from './template';

interface ISplitViewPaneArgs extends IUXElementArgs {
  pane?: PaneModel
  content?: unknown
  fixed?: boolean;
  hasItemsSource?: boolean
  classNamesBuilder?: ClassNamesBuilder
}

export class Pane extends UXElement<ISplitViewPaneArgs> {
  constructor(
    owner: any,
    args: ISplitViewPaneArgs
  ) {
    super(owner, args);
  }

  public get fixed() {
    return this.args.fixed ?? false;
  }

  public get hasItemsSource()
    : boolean | undefined {
    return this.args.hasItemsSource
  }

  public get classNames()
    : string {

    if (this.args.classNamesBuilder) {
      return `${this.args.classNamesBuilder(
        'pane', { '$fixed': this.args.fixed }
      )}`;
    }

    return '';
  }

  public get content()
    : unknown {
    return this.args.pane?.content ?? this.args.content;
  }

  public get elementId() {
    return guidFor(this)
  }
}

export default Pane.RegisterTemplate(layout);