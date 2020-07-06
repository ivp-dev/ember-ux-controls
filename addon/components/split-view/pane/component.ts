import { guidFor } from '@ember/object/internals';
import { ClassNamesBuilder } from 'ember-ux-core/utils/bem';
import UXElement, { IUXElementArgs } from 'ember-ux-core/components/ux-element';
// @ts-ignore
import layout from './template';
import { SplitView } from '../component';
import { action } from '@ember/object';
import { scheduleOnce } from '@ember/runloop';
import ItemsControl from 'ember-ux-core/components/items-control';
import PaneModel from 'ember-ux-controls/common/classes/pane-model';

interface ISplitViewPaneArgs extends IUXElementArgs {
  pane?: PaneModel
  content?: unknown
  fixed?: boolean;
  classNamesBuilder?: ClassNamesBuilder
}

export class Pane extends UXElement<ISplitViewPaneArgs> {
  constructor(
    owner: any,
    args: ISplitViewPaneArgs,
    props?: ISplitViewPaneArgs
  ) {
    super(owner, args, props);
  }

  public get fixed() {
    return this.args.fixed ?? false;
  }

  public get hasItemsSource()
    : boolean {
    return this.parentElement instanceof ItemsControl && this.parentElement.hasItemsSource
  } 

  public get classNames()
    : string {
    if (this.parentElement instanceof SplitView) {
      return `${this.parentElement.classNamesBuilder('pane', { '$fixed': this.args.fixed })}`
    }

    if (this.args.classNamesBuilder) {
      return `${this.args.classNamesBuilder('pane', { '$fixed': this.args.fixed })}`;
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

  protected get html()
    : HTMLElement | null {
    return this._html;
  }

  protected set html(
    value: HTMLElement | null
  ) {
    if (this._html !== value) {
      this._html = value;
    }
  }

  @action
  public didInsert(
    element: HTMLElement
  ): void {
    const
      parentElement: unknown = this.parentElement;

    if (
      parentElement instanceof SplitView &&
      !parentElement.hasItemsSource
    ) {
      scheduleOnce('afterRender', this, () => {
        parentElement.addChild(this);
      })
    }

    this.html = element;
  }

  private _html: HTMLElement | null = null;
}

export default Pane.RegisterTemplate(layout);