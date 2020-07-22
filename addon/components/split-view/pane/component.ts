import { guidFor } from '@ember/object/internals';
import { ClassNamesBuilder } from 'ember-ux-core/utils/bem';
import UXElement, { IUXElementArgs } from 'ember-ux-core/components/ux-element';
import { SplitView } from '../component';
import { action } from '@ember/object';
import { next } from '@ember/runloop';
import PaneModel from 'ember-ux-controls/common/classes/split-view-pane-model';
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
      parentElement: unknown = this.logicalParent;

    if (
      parentElement instanceof SplitView &&
      !parentElement.hasItemsSource
    ) {
      next(this, () => {
        parentElement.addChild(this);
      })
    }

    this.html = element;
  }

  private _html: HTMLElement | null = null;
}

export default Pane.RegisterTemplate(layout);