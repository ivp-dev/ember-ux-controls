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
import Sensor from 'ember-ux-controls/common/classes/sensor';
import { DragMoveSensorEventArgs, DragStartSensorEventArgs, DragStopSensorEventArgs } from 'ember-ux-controls/common/classes/concrete-sensors/drag-mouse-sensor';

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
  sizes?: Array<number>,
  minSize?: number,
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

  public get sizes() {
    return this.args.sizes;
  }

  public get barSize() {
    return this.args.barSize ?? 3;
  }

  public get fluent() {
    return this.args.fluent ?? false;
  }

  public get minSizes()
    : Array<number> | undefined {
    return this.args.minSizes;
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

  public get minSize()
    : number {
    return this.minSize ?? 0;
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
    this.eventHandler.emitEvent(this, SplitViewPaneSizeChangedEventArgs, sizes);

    if (typeof this.args.onSizeChanged === 'function') {
      this.args.onSizeChanged(sizes);
    }
  }

  @action
  public didInsert(
    element: HTMLElement
  ) {
    this._html = element;
    this.setupBehavior();
  }

  @action
  public didUpdateAttrs() {
    this.removeBehavior();
    this.setupBehavior();
  }

  public willDestroy() {
    this.removeBehavior();
  }

  private setupBehavior() {
    let
      behavior: SplitViewBehavior,
      onDragStart: (sender: Sensor, args: DragStartSensorEventArgs) => void,
      onDragMove: (sender: Sensor, args: DragMoveSensorEventArgs) => void,
      onDragStop: (sender: Sensor, args: DragStopSensorEventArgs) => void;

    behavior = new SplitViewBehavior(
      this,
      this.html!,
      this.args.sizes,
      this.args.minSize,
      this.args.minSizes,
    );

    onDragStart = behavior.dragStart.bind(behavior);
    onDragMove = behavior.dragMove.bind(behavior);
    onDragStop = behavior.dragStop.bind(behavior);

    this.eventHandler.addEventListener(this, DragStartSensorEventArgs, onDragStart);
    this.eventHandler.addEventListener(this, DragMoveSensorEventArgs, onDragMove);
    this.eventHandler.addEventListener(this, DragStopSensorEventArgs, onDragStop);

    this._onDragStart = onDragStart;
    this._onDragMove = onDragMove;
    this._onDragStop = onDragStop;

    this._behavior = behavior;
  }

  private removeBehavior() {
    if (!this._behavior) {
      return;
    };

    if (this._onDragStart) {
      this.eventHandler.removeEventListener(
        this,
        DragStartSensorEventArgs,
        this._onDragStart
      );
    }

    if (this._onDragMove) {
      this.eventHandler.removeEventListener(
        this,
        DragMoveSensorEventArgs,
        this._onDragMove
      );
    }

    if (this._onDragStop) {
      this.eventHandler.removeEventListener(
        this,
        DragStopSensorEventArgs,
        this._onDragStop
      );
    }

    this._onDragStart = void 0;
    this._onDragMove = void 0;
    this._onDragStop = void 0;

    this._behavior = void 0
  }

  private _html?: HTMLElement
  private _behavior?: SplitViewBehavior
  private _onDragStart?: (sender: Sensor, args: DragStartSensorEventArgs) => void
  private _onDragMove?: (sender: Sensor, args: DragMoveSensorEventArgs) => void
  private _onDragStop?: (sender: Sensor, args: DragStopSensorEventArgs) => void
}

function isContentElement(
  obj: unknown
): obj is IContentElement {
  return (
    typeof (<IContentElement>obj).content !== 'undefined'
  );
}

export default SplitView.RegisterTemplate(layout)

