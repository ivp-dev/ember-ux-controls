// @ts-ignore
import layout from './template';
import ItemsControl, { IItemsControlArgs } from 'ember-ux-controls/common/classes/items-control'
import bem, { ClassNamesBuilder } from 'ember-ux-controls/utils/bem';
import { Axes, Side, Size } from 'ember-ux-controls/common/types';
import { SplitViewPane, ISplitViewPaneArgs } from 'ember-ux-controls/components/split-view/pane/component';
import { IContentElement } from 'ember-ux-controls/common/types';
import { camelize } from '@ember/string';
import { notifyPropertyChange } from '@ember/object';
import SplitViewBehavior from 'ember-ux-controls/common/classes/-private/split-view-behavior';
import { action } from '@ember/object';
import { BaseEventArgs } from 'ember-ux-controls/common/classes/event-args';

export class SplitViewPaneSizeChangedEventArgs extends BaseEventArgs {
  constructor(public sizes: number[]) {
    super();
  }
}

export class PaneModel {
  public get content() {
    return this._content;
  }

  public set content(value: unknown) {
    if (this._content !== value) {
      this._content = value;
      notifyPropertyChange(this, 'content');
    }
  }

  public get item() {
    return this._item;
  }

  public set item(value: unknown) {
    if (this._item !== value) {
      this._item = value;
      notifyPropertyChange(this, 'item');
    }
  }

  private _item: unknown;
  private _content: unknown;
}

export interface ISplitViewArgs extends IItemsControlArgs {
  axis?: Axes
  responsive?: boolean,
  fluent?: boolean,
  barSize?: number,
  minPaneSize?: number,
  sizes?: Array<number>,
  minPaneSizes?: Array<number>,
  getContent?: (item: unknown) => unknown
  onSizeChanged?: (sizes: Array<number>) => void
}

export class SplitView<T extends ISplitViewArgs> extends ItemsControl<T> {
  constructor(
    owner: any,
    args: T
  ) {
    super(owner, args);

    this.willDestroy = this.clearBehavior.bind(this);
  }

  public get itemTemplateName() {
    return (
      super.itemTemplateName ??
      'split-view/pane'
    );
  }

  public get sizes() {
    return this.args.sizes;
  }

  public get barSize() {
    return this.args.barSize ?? 3;
  }

  public get fluent() {
    return this.args.fluent ?? false;
  }

  public get minPaneSizes()
    : Array<number> | undefined {
    return this.args.minPaneSizes;
  }

  public get responsive() {
    return this.args.responsive ?? false;
  }

  public get sizeTarget() {
    return this.axis === Axes.X
      ? Size.Width
      : Size.Height;
  }

  public get maxSizeTarget()
    : string {
    return camelize('max-' + this.sizeTarget);
  }

  public get minPaneSize()
    : number {
    return this.minPaneSize ?? 0;
  }

  public get sideOrigin() {
    return this.axis === Axes.X
      ? Side.Left
      : Side.Top;
  }

  public get sideTarget() {
    return this.axis === Axes.X
      ? Side.Right
      : Side.Bottom;
  }

  public get classNamesBuilder()
    : ClassNamesBuilder {
    return bem(`split-view`, `$${this.axis}`);
  }

  public get classNames()
    : string {
    return `${this.classNamesBuilder}`;
  }

  public get axis()
    : Axes {
    return (
      this.args.axis ??
      Axes.X
    );
  }

  public get html() {
    return this._html;
  }

  protected get behavior() {
    return this._behavior;
  }

  public itemItsOwnContainer(
    item: unknown
  ): item is SplitViewPane<ISplitViewPaneArgs> {
    let
      result: boolean

    result = item instanceof SplitViewPane;

    return result;
  }

  public createContainerForItem()
    : PaneModel {
    return new PaneModel();
  }

  public prepareItemContainer(
    container: PaneModel
  ): void {
    let
      item: unknown;

    item = this.readItemFromContainer(container);

    if (this.itemItsOwnContainer(item)) {
      return;
    }

    if (isContentElement(item)) {
      container.content = item.content;
    } else if (
      typeof this.args.getContent === 'function'
    ) {
      container.content = this.args.getContent(item)
    } else {
      throw new Error(`Can't extract content from item`);
    }
  }

  public clearContainerForItem(
    container: PaneModel
  ): void {
    container.item = null;
    container.content = null;
  }

  public linkContainerToItem(
    container: PaneModel,
    item: unknown
  ): void {
    container.item = item;
  }

  public readItemFromContainer(
    container: PaneModel
  ): unknown {
    return container.item;
  }

  public onSizesChanged(sizes: number[]) {
    this.eventHandler.emitEvent(this, SplitViewPaneSizeChangedEventArgs, sizes)
  }

  @action
  public didInsert(
    element: HTMLElement
  ) {
    this._behavior = new SplitViewBehavior(
      this,
      element,
      this.args.sizes,
      this.args.minPaneSize,
      this.args.minPaneSizes,
    );

    this._html = element;
  }

  public didUpdateAttrs() {

  }

  private clearBehavior() {
    if (!this._behavior) {
      return;
    };

    this._behavior.dispose();
    this._behavior = void 0
  }

  private _html?: HTMLElement
  private _behavior?: SplitViewBehavior
}

function isContentElement(
  obj: unknown
): obj is IContentElement {
  return (
    typeof (<IContentElement>obj).content !== 'undefined'
  );
}

export default SplitView.RegisterTemplate(layout)

