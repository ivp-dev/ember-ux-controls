// @ts-ignore
import layout from './template';
import ItemsControl, { IItemsControlArgs } from 'ember-ux-controls/common/classes/items-control'
import bem, { ClassNamesBuilder } from 'ember-ux-controls/utils/bem';
import { Axes, IPointer, Side, Size } from 'ember-ux-controls/common/types';
import { Pane } from './pane/component';
import { IContentElement } from 'ember-ux-controls/common/types';
import { camelize } from '@ember/string';
import { notifyPropertyChange } from '@ember/object';
import children from 'ember-ux-controls/utils/dom/children';
import find from 'ember-ux-controls/utils/dom/find';
import addClass from 'ember-ux-controls/utils/dom/add-class';
import css from 'ember-ux-controls/utils/dom/css';
import appendTo from 'ember-ux-controls/utils/dom/append-to';
import { DragMoveSensorEventArgs, DragStartSensorEventArgs, DragStopSensorEventArgs } from 'ember-ux-controls/common/classes/concrete-sensors/drag-mouse-sensor';
import closest from 'ember-ux-controls/utils/dom/closest';
import DragSensor from 'ember-ux-controls/common/classes/drag-sensor';

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

type Behavior = {
  dragMove: (sender: DragSensor, args: DragMoveSensorEventArgs) => void
  dragStart: (sender: DragSensor, args: DragStartSensorEventArgs) => void
  dragStop: (sender: DragSensor, args: DragStopSensorEventArgs) => void
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

  public get minPaneSizes()
    : Array<number> | undefined {
    return this.args.minPaneSizes;
  }

  public get responsive() {
    return this.args.responsive ?? false;
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

  public itemItsOwnContainer(
    item: unknown
  ): item is Pane {
    let
      result: boolean

    result = item instanceof Pane;

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

    item = this.readItemFromContainer(container)

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

  public didInsert(
    element: HTMLElement
  ) {
    let
      behavior: Behavior;

    behavior = new SplitView.Behavior(
      element,
      this.axis,
      this.fluent,
      this.responsive,
      this.barSize,
      this.classNamesBuilder,
      this.args.sizes,
      this.args.minPaneSize,
      this.args.minPaneSizes,
      this.args.onSizeChanged
    );

    this.eventHandler.addEventListener(
      this,
      DragStartSensorEventArgs,
      behavior.dragStart
    );

    this.eventHandler.addEventListener(
      this,
      DragMoveSensorEventArgs,
      behavior.dragMove
    );

    this.eventHandler.addEventListener(
      this,
      DragStopSensorEventArgs,
      behavior.dragStop
    );

    this._behavior = behavior;
    this._html = element;
  }

  public didUpdateAttrs() {

  }

  public willDestroy() {
    super.willDestroy();

  }

  public html() {
    return this._html;
  }

  private static Behavior = class {
    private ids: string[]
    private panes: HTMLElement[]
    private sizes: Array<number>
    private minSizes: Array<number>
    private onSizeChanged?: (sizes: Array<number>) => void
    constructor(
      public element: HTMLElement,
      public axis: Axes,
      public fluent: boolean,
      public responsive: boolean,
      public barSize: number,
      public classNamesBuilder: ClassNamesBuilder,
      sizes?: Array<number>,
      minSize?: number,
      minSizes?: Array<number>,
      onSizeChanged?: (sizes: number[]) => void
    ) {
      this.ids = this.setupIds();
      this.panes = this.setupPanes();
      this.sizes = this.calcSizes(sizes);
      this.minSizes = this.calcMinSizes(minSize, minSizes);

      this.setupBars();
      this.applySizes();

      this.onSizeChanged = onSizeChanged;

      if (typeof this.onSizeChanged === 'function') {
        this.onSizeChanged(this.sizes.slice());
      }
    }

    get sizeTarget()
      : Size {
      return this.axis === Axes.X
        ? Size.Width
        : Size.Height;
    }

    get maxSizeTarget()
      : string {
      return camelize('max-' + this.sizeTarget);
    }

    get sideOrigin()
      : Side {
      return this.axis === Axes.X
        ? Side.Left
        : Side.Top;
    }

    get sideTarget()
      : Side {
      return this.axis === Axes.X
        ? Side.Right
        : Side.Bottom;
    }

    public dragMove(_sender: DragSensor, args: DragMoveSensorEventArgs) {
      if (closest(args.target as Element, this.element)) {
        console.log(args.target);
      }
      //preventNativeEvent(_args.originalEvent)
    }

    public dragStart(
      sender: DragSensor, 
      args: DragStartSensorEventArgs
    ) {
      let
        target: HTMLElement,
        pointer: IPointer;

      target = args.target as HTMLElement;

      if(closest(target, this.element)) {
        args.stopPropagation();
      } else {
        return;
      }

    }

    public dragStop(
      sender: DragSensor, 
      args: DragStopSensorEventArgs
    ) {

    }

    private setupIds() {
      return children(
        this.element,
        `.${this.classNamesBuilder('pane')}`
      ).map((e: Element) => e.id);
    }

    private setupPanes() {
      return this.ids.map(id =>
        find(this.element, `#${id}`)[0]
      ) as HTMLElement[];
    }

    private calcSizes(sizes?: Array<number>) {
      return sizes ?? this.ids.map(() =>
        100 / this.ids.length
      );
    }

    private calcBarSize() {
      return this.barSize * (this.ids.length - 1) / this.ids.length;
    }

    private calcMinSizes(minSize?: number, minSizes?: Array<number>) {
      return minSizes ?? this.ids.map(() =>
        minSize ?? 0
      );
    }

    private setupBars() {
      let
        pane: HTMLElement | null = null,
        count: number,
        index: number,
        bar: HTMLDivElement;

      for (
        index = 0,
        count = this.panes.length;
        index < count - 1;
        index++
      ) {
        pane = this.panes[index];
        bar = document.createElement('div');
        addClass(bar, `${this.classNamesBuilder('bar', {
          [`$${this.axis}`]: true
        })}`);
        css(bar, {
          [this.sizeTarget]: `${this.barSize}px`
        });
        // add bar after pane (before next pane)
        appendTo(
          this.element,
          bar,
          pane.nextSibling
        );
      }
    }

    private applySizes() {
      let
        style: { [K in Size]?: string },
        size: number,
        idx: number;

      style = {};

      for (
        idx = 0;
        idx < this.panes.length;
        idx++
      ) {
        size = this.sizes[idx];
        style[this.sizeTarget] = `calc(${size}% - ${this.calcBarSize}px)`;
        css(this.panes[idx], style);
      }

    }

    private _html?: HTMLElement
  }

  private _html?: HTMLElement
  private _behavior?: Behavior
}

function isContentElement(
  obj: unknown
): obj is IContentElement {
  return (
    typeof (<IContentElement>obj).content !== 'undefined'
  );
}

export default SplitView.RegisterTemplate(layout)

