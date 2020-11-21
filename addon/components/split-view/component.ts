// @ts-ignore
import layout from './template';
import ItemsControl, { IItemsControlArgs } from 'ember-ux-controls/common/classes/items-control'
import { Axes, IEventEmmiter } from 'ember-ux-controls/common/types';
import { SplitViewPane } from 'ember-ux-controls/components/split-view/pane/component';
import { IContentElement } from 'ember-ux-controls/common/types';
import { notifyPropertyChange } from '@ember/object';
import { action } from '@ember/object';
import { BaseEventArgs } from 'ember-ux-controls/common/classes/event-args';
import { getOwner } from '@ember/application';
import { computed } from '@ember/object';
import DragSensor from 'ember-ux-controls/common/classes/drag-sensor';
import bem from 'ember-ux-controls/utils/bem';
import { A } from '@ember/array';
import {
  DragMoveSensorEventArgs,
  DragStartSensorEventArgs,
  DragStopSensorEventArgs
} from 'ember-ux-controls/common/classes/concrete-sensors/drag-mouse-sensor';
import SyncProxyArray from 'ember-ux-controls/common/classes/-private/sync-proxy-array';
import { ISplitViewBehaviorArgs, SplitViewBehavior } from 'ember-ux-controls/common/classes/-private/split-view-behavior';

export class SplitViewPaneSizeChangedEventArgs extends BaseEventArgs {
  constructor(public sizes: number[]) {
    super();
  }
}

export interface ISplitViewContainer {
  content: unknown,
  item: unknown
}

export class SplitViewPaneModel implements ISplitViewContainer {

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

export interface ISplitViewArgs extends Partial<ISplitViewBehaviorArgs>, IItemsControlArgs {
  sizes?: Array<number>,
  minSizes?: Array<number>,
  getContent?: (item: unknown) => unknown
  onSizeChanged?: (sizes: Array<number>) => void
}

export class SplitView<T extends ISplitViewArgs> extends ItemsControl<T> {
  constructor(
    owner: any,
    args: T
  ) {
    super(owner, args);
  }

  public get itemTemplateName() {
    return (
      super.itemTemplateName ??
      'split-view/pane'
    );
  }

  @computed('args.{barSize}')
  public get barSize() {
    return this.args.barSize ?? 3;
  }

  @computed('args.{fluent}')
  public get fluent() {
    return this.args.fluent ?? false;
  }

  @computed('args.{axis}')
  public get axis()
    : Axes {
    return this.args.axis ?? Axes.X;
  }

  @computed('args.{responsive}')
  public get responsive() {
    return this.args.responsive ?? false;
  }

  @computed('args.{minSize}')
  public get minSize()
    : number {
    return this.args.minSize ?? 0;
  }

  @computed('args.{sizes}')
  public get sizes() {
    if (!this._sizes) {
      return SplitView.SizeCollection.create({
        source: A(this.args.sizes)
      });
    } else if (this.args.sizes) {
      this._sizes.source = A(this.args.sizes);
    }

    return this._sizes;
  }

  @computed('axis')
  private get classNamesBuilder() {
    return bem('split-view', `$${this.axis}`);
  }

  @computed('classNamesBuilder')
  public get classNames() {
    return `${this.classNamesBuilder}`;
  }

  public get html() {
    return this._html;
  }

  public set html(value: HTMLElement | undefined) {
    if (this._html !== value) {
      this._html = value;
    }
  }

  private get globalEventEmmiter(): IEventEmmiter {
    if (!this._globalEventEmmiter) {
      this._globalEventEmmiter = (
        getOwner(this).lookup('service:event-emmiter')
      ) as IEventEmmiter;
    }

    return this._globalEventEmmiter;
  }

  public itemItsOwnContainer(
    item: unknown
  ): item is ISplitViewContainer {
    let
      result: boolean

    result = (
      item instanceof SplitViewPane || 
      item instanceof SplitViewPaneModel
    );

    return result;
  }

  public createContainerForItem()
    : ISplitViewContainer {
    return new SplitViewPaneModel();
  }

  public prepareItemContainer(
    container: ISplitViewContainer
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
    container: ISplitViewContainer
  ): void {
    container.item = null;
    container.content = null;
  }

  public linkContainerToItem(
    container: ISplitViewContainer,
    item: unknown
  ): void {
    container.item = item;
  }

  public readItemFromContainer(
    container: ISplitViewContainer
  ): unknown {
    return container.item;
  }

  @action
  public didInsert(
    element: HTMLElement
  ) {
    let
      args: ISplitViewBehaviorArgs,
      behavior: SplitViewBehavior;

    args = {
      axis: this.axis,
      barSize: this.barSize,
      fluent: this.fluent,
      minSize: this.minSize,
      responsive: this.responsive,
    };

    behavior = new SplitViewBehavior(
      element,
      this.classNamesBuilder,
      args,
      this.onSizeChanged.bind(this),
      this.args.sizes,
      this.args.minSizes
    );

    this.globalEventEmmiter.addEventListener(
      this,
      DragStartSensorEventArgs,
      this.dragStart
    );

    this.globalEventEmmiter.addEventListener(
      this,
      DragMoveSensorEventArgs,
      this.dragMove
    );

    this.globalEventEmmiter.addEventListener(
      this,
      DragStopSensorEventArgs,
      this.dragStop
    );

    this._behavior = behavior;
    this._html = element;
  }

  @action
  public didUpdateAttrs() {
    let
      args: ISplitViewBehaviorArgs;

    args = {
      axis: this.axis,
      barSize: this.barSize,
      fluent: this.fluent,
      minSize: this.minSize,
      responsive: this.responsive
    };

    if (this._behavior) {
      this._behavior.update(
        args,
        this.args.sizes,
        this.args.minSizes
      );
    }
  }

  public willDestroy() {
    super.willDestroy();

    if (!this._behavior) {
      return;
    }

    this.globalEventEmmiter.removeEventListener(
      this,
      DragStartSensorEventArgs,
      this.dragStart
    );

    this.globalEventEmmiter.removeEventListener(
      this,
      DragMoveSensorEventArgs,
      this.dragMove
    );

    this.globalEventEmmiter.removeEventListener(
      this,
      DragStopSensorEventArgs,
      this.dragStop
    );
  }

  protected onSizeChanged(sizes: Array<number>) {
    if (this.args.onSizeChanged) {
      this.args.onSizeChanged(sizes);
    }
  }

  private dragStart(
    _sender: DragSensor,
    args: DragStartSensorEventArgs
  ) {
    if (this._behavior) {
      this._behavior.dragStart(args);
    }
  }

  private dragMove(
    _sender: DragSensor,
    args: DragMoveSensorEventArgs
  ) {
    if (this._behavior) {
      this._behavior.dragMove(args);
    }
  }

  private dragStop(
    _sender: DragSensor,
    args: DragStopSensorEventArgs
  ) {
    if (this._behavior) {
      this._behavior.dragStop(args);
    }
  }

  private static SizeCollection = class extends SyncProxyArray<number, number> {
    protected serializeToContent(
      source: number
    ): number {
      return source;
    }
    protected serializeToSource(
      content: number
    ): number {
      return content;
    }
  }

  private _behavior?: SplitViewBehavior
  private _html?: HTMLElement
  private _sizes?: SyncProxyArray<number, number>
  private _globalEventEmmiter?: IEventEmmiter
}


function isContentElement(
  obj: unknown
): obj is IContentElement {
  return (
    typeof (<IContentElement>obj).content !== 'undefined'
  );
}

export default SplitView.RegisterTemplate(layout)

