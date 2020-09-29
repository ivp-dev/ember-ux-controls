// @ts-ignore
import layout from './template';
import ItemsControl, { IItemsControlArgs } from 'ember-ux-controls/common/classes/items-control'
import bem, { ClassNamesBuilder } from 'ember-ux-controls/utils/bem';
import { Axes, IDisposable, IEventEmmiter, IPointer, Side, Size } from 'ember-ux-controls/common/types';
import { SplitViewPane, ISplitViewPaneArgs } from 'ember-ux-controls/components/split-view/pane/component';
import { IContentElement } from 'ember-ux-controls/common/types';
import { camelize } from '@ember/string';
import { notifyPropertyChange } from '@ember/object';
import children from 'ember-ux-controls/utils/dom/children';
import find from 'ember-ux-controls/utils/dom/find';
import addClass from 'ember-ux-controls/utils/dom/add-class';
import css from 'ember-ux-controls/utils/dom/css';
import appendTo from 'ember-ux-controls/utils/dom/append-to';
import closest from 'ember-ux-controls/utils/dom/closest';
import DragSensor from 'ember-ux-controls/common/classes/drag-sensor';
import { action } from '@ember/object';
import {
  DragMoveSensorEventArgs,
  DragStartSensorEventArgs,
  DragStopSensorEventArgs
} from 'ember-ux-controls/common/classes/concrete-sensors/drag-mouse-sensor';
import rect from 'ember-ux-controls/utils/dom/rect';
import preventNativeEvent from 'dummy/utils/prevent-native-event';
import hasClass from 'dummy/utils/dom/has-class';

interface IBlockSizes {
  size: number,
  minSize: number
  sizes: Array<number>,
  minSizes: Array<number>,
  avaialbleSizes: Array<number>,
  availableSize: number
}

interface IDrag {
  /**
   * Represents an array of panes which located between active (dragging) bar.
   * Array may contains two value-types: Array<string> and string depending 
   * on the value of the property 'SplitView.Responsive'.
   * 
   * In case of Responsive:true the array will looks like : 
   * [[pane1, pane2, ...],[pane3, pane4, ...]]. In case of Responsive:false 
   * the array will be like: [pane1, [pane2], [pane3], pane4, ...] 
   * where pane# is #id of SplitView::Pane component.
   */
  layout: Array<string | Array<string>>,
  startPosition: number,
  startOffset: number,
  previous: string,
  next: string,
  decorator: HTMLElement
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

type Behavior = {
  activate: (meta: IDrag) => void
  deactivate: () => void
} & IDisposable

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

  @action
  public didInsert(
    element: HTMLElement
  ) {
    let
      behavior: Behavior;

    this._html = element;

    this.eventHandler.addEventListener(
      this,
      DragStartSensorEventArgs,
      this.dragStart
    );

    this.eventHandler.addEventListener(
      this,
      DragMoveSensorEventArgs,
      this.dragMove
    );

    this.eventHandler.addEventListener(
      this,
      DragStopSensorEventArgs,
      this.dragStop
    );
  }

  public didUpdateAttrs() {

  }

  public willDestroy() {
    this.eventHandler.removeEventListener(
      this,
      DragStartSensorEventArgs,
      this.dragStart
    );

    this.eventHandler.removeEventListener(
      this,
      DragMoveSensorEventArgs,
      this.dragMove
    );

    this.eventHandler.removeEventListener(
      this,
      DragStopSensorEventArgs,
      this.dragStop
    );

    this.clearBehavior();

    super.willDestroy();
  }

  public get html() {
    return this._html;
  }

  private clearBehavior() {
    if (this._behavior) {
      this._behavior.dispose();
    }
  }

  @action
  private dragMove(
    sender: DragSensor,
    args: DragMoveSensorEventArgs
  ) {

    if (!this.html || !closest(args.target as Element, this.html)) {
      return
    }


    preventNativeEvent(args.originalEvent)
  }

  @action
  private dragStart(
    sender: DragSensor,
    args: DragStartSensorEventArgs
  ) {
    let
      behavior: Behavior,
      target: HTMLElement,
      pointer: IPointer;

    target = args.target as HTMLElement;

    if (
      !this.html || !(
        hasClass(target, this.classNamesBuilder('bar', '@fixed').base) &&
        closest(target, this.html)
      )
    ) {
      return;
    }

    args.stopPropagation();

    behavior = new SplitView.Behavior(
      this,
      this.html,
      this.args.sizes,
      this.args.minPaneSize,
      this.args.minPaneSizes,
      this.args.onSizeChanged
    );

    behavior.activate()

    this._behavior = behavior;
  }

  @action
  private dragStop() /*sender: DragSensor, args: DragStopSensorEventArgs*/ {
    if (this._behavior) {
      this._behavior.deactivate();
    }
  }

  private static Behavior = class implements IDisposable {
    constructor(
      public owner: SplitView<ISplitViewArgs>,
      public element: HTMLElement,
      sizes?: Array<number>,
      minSize?: number,
      minSizes?: Array<number>,
      onSizeChanged?: (sizes: number[]) => void
    ) {

      this.ids = this.setupIds();
      this.panes = this.setupPanes();
      this.minSizes = this.calcMinSizes(minSize, minSizes);
      this.sizes = this.calcSizes(sizes);
      this.onSizeChanged = onSizeChanged;

      if (typeof this.onSizeChanged === 'function') {
        this.onSizeChanged(this.sizes.slice());
      }

      this.setupBars();
      this.applySizes();

      this.isActive = false;
    }

    public isActive: boolean

    public get axis()
      : Axes {
      return this.owner.axis
    }

    public get fluent()
      : boolean {
      return this.owner.fluent
    }

    public get responsive()
      : boolean {
      return this.owner.responsive
    }

    public get barSize()
      : number {
      return this.owner.barSize
    }

    public get eventHandler()
      : IEventEmmiter {
      return this.owner.eventHandler
    }

    public get classNamesBuilder()
      : ClassNamesBuilder {
      return this.owner.classNamesBuilder
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

    public dispose() {

    }

    public activate(meta: IDrag) {
      this.isActive = true;
    }

    public deactivate() {
      this.isActive = false
    }

    private measure(
      portSize: number,
      offset: number,
      layout: Array<string | Array<string>>
    ): void {
      let
        ids: string[],
        sign: number,
        sizes: number[],
        reducedSize: number,
        absOffset: number,
        blocks: string[][],
        idx: number,
        jdx: number,
        sum: number,
        index: number,
        ratio: number,
        block: string[],
        reduce: boolean,
        increase: boolean,
        indexes: number[],
        blockSizes: IBlockSizes;

      ids = this.ids.slice();
      sign = Math.sign(offset);
      reducedSize = 0;
      absOffset = Math.abs(offset);
      blocks = this.blocks(layout)
      sizes = this.sizes.map(size =>
        size * portSize / 100
      );

      if (sign > 0) {
        blocks = blocks.reverse();
      }

      for ([idx, block] of blocks.entries()) {
        reduce = idx === 0;
        increase = idx === 1;
        indexes = block.map(pane => ids.indexOf(pane));
        blockSizes = this.absoluteBlockSizes(portSize, block);

        // to prevent overflows
        if (reduce && blockSizes.size - absOffset < blockSizes.minSize) {
          absOffset = blockSizes.size - blockSizes.minSize;
        }

        if (reduce && blockSizes.availableSize === 0) {
          continue
        }

        // apply sizes for all panes in block
        for ([jdx, index] of indexes.entries()) {
          if (
            // if increase, evenly spread the offset
            // between panes in block 
            increase
          ) {
            sizes[index] += reducedSize / block.length
          }
          else if (
            // if reduce, apply the offset relatively
            // to the current available size of block
            // and current size of pane
            reduce
          ) {
            ratio = (blockSizes.availableSize - absOffset) / blockSizes.availableSize;
            sizes[index] = blockSizes.avaialbleSizes[jdx] * ratio + blockSizes.minSizes[jdx];
            reducedSize += sizes[index];
          }
        }

        reducedSize = blockSizes.size - reducedSize;
      }

      sum = sizes.reduce((a, b) => a + b, 0);
      if (sum !== portSize) {
        sizes = sizes.map((size) => size * portSize / sum)
      }

      this.sizes = sizes.map(size =>
        size / portSize * 100
      );

      if (typeof this.onSizeChanged === 'function') {
        this.onSizeChanged(this.sizes.slice());
      }
    }

    private arrange(
      coordinates: IPointer
    ): void {
      let
        drag: Readonly<IDrag> | null,
        portRect: DOMRect,
        clientAxis: number,
        offset: number,
        portSize: number,
        positive: boolean,
        offsetStart: number,
        startPosition: number,
        pair: string[],
        edges: number[],
        blocks: string[][],
        absBlockSizes: IBlockSizes,
        size: number,
        max: number,
        min: number;

      drag = this.drag;

      if (drag === null) {
        return;
      }

      portRect = rect(this.element);
      clientAxis = coordinates.position;
      offset = clientAxis - drag.startPosition;
      portSize = portRect[this.sizeTarget];
      positive = offset >= 0;
      offsetStart = portRect[this.sideOrigin];
      pair = [drag.previous, drag.next];
      edges = this.edges(portSize, offsetStart, pair);
      max = Math.max(...edges);
      min = Math.min(...edges);

      // if fluent we no need to resize decorator.
      if (this.fluent) {
        startPosition = clientAxis;
        this.measure(portSize, offset, drag.layout);
        this.applySizes();
        if (
          startPosition > max - (this.barSize - drag.startOffset) ||
          startPosition < min + drag.startOffset
        ) {
          startPosition = positive
            ? max - (this.barSize - drag.startOffset)
            : min + drag.startOffset
        }
        setReadOnly(drag, 'startPosition', startPosition);
      } else {
        blocks = this.blocks(drag.layout);
        absBlockSizes = this.absoluteBlockSizes(
          portSize,
          blocks[~~positive]
        );
        size = Math.min(
          Math.abs(offset),
          absBlockSizes.availableSize
        );

        css(drag.decorator, {
          [this.sideOrigin]: positive ? this.barSize + 'px' : 'auto',
          [this.sideTarget]: positive ? 'auto' : this.barSize + 'px',
          [this.sizeTarget]: size + 'px'
        });
      }
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

    private split(
      pair: Array<string>,
      responsive: boolean
    ) {
      let
        idx: number,
        index: number,
        result: Array<string | Array<string>>

      result = pair.map(id =>
        [id]
      );

      for (
        idx = 0, index = this.ids.indexOf(pair[idx]);
        idx < this.ids.length;
        idx++
      ) {
        if (!pair.some(id => id === this.ids[idx])) {
          if (responsive) {
            Array.prototype.splice.call(
              result[~~(idx > index)], idx % index, 0, this.ids[idx]
            );
          } else {
            result.splice(idx, 0, this.ids[idx]);
          }
        } else {
          index = this.ids.indexOf(this.ids[idx]);
        }
      }
      return result;
    }

    /**
     * Get borders of resizable port
     * @param portSize 
     * @param offsetStart 
     * @param pair
     */
    private edges(
      portSize: number,
      offsetStart: number,
      pair: Array<string>
    ): Array<number> {
      let
        blockSize: number,
        edges: number[],
        entry: number,
        sizes: number[],
        minSizes: number[];

      edges = [offsetStart, portSize + offsetStart];
      entry = this.ids.indexOf(pair[1]);
      sizes = this.sizes.map(size => size * portSize / 100);
      minSizes = this.minSizes.map(size =>
        Math.max(size * portSize / 100, this.calcBarSize())
      );

      return [
        this.ids.slice(0, entry),
        this.ids.slice(entry),
      ].map((block, index) => {
        blockSize = block.map(pane =>
          !this.responsive && !pair.some(p => p === pane)
            ? sizes[this.ids.indexOf(pane)]
            : minSizes[this.ids.indexOf(pane)]
        ).reduce(
          (a, b) => a + b - this.calcBarSize(),
          this.barSize * (block.length - 1)
        );

        /* ~~(index > 0) - 1 | 1  convert true in 1 and false in -1*/
        return edges[index] + blockSize * -(~~(index > 0) - 1 | 1);
      })
    }

    private blocks(
      layout: Array<string | Array<string>>
    ): Array<Array<string>> {
      let
        result: string[][]

      result = this.responsive
        // if responsive layout will be array of arrays
        ? layout.slice() as Array<Array<string>>
        // else needs leave only arrays
        : layout.filter(b =>
          b instanceof Array) as Array<Array<string>>;

      return result
    }

    private absoluteBlockSizes(
      portSize: number,
      block: Array<string>
    ): IBlockSizes {
      let
        indexes: number[],
        sizes: number[],
        size: number,
        minSizes: number[],
        minSize: number,
        avaialbleSizes: number[],
        availableSize: number;

      indexes = block.map(pane => this.ids.indexOf(pane));
      sizes = indexes.map(index =>
        this.sizes[index] * portSize / 100);
      size = sizes.reduce((a, b) => a + b, 0);
      minSizes = indexes.map(index =>
        Math.max(this.minSizes[index] * portSize / 100, this.calcBarSize()));
      minSize = minSizes.reduce((a, b) => a + b, 0);
      avaialbleSizes = sizes.map((size, i) => size - minSizes[i]);
      availableSize = size - minSize;

      return {
        size,
        sizes,
        minSize,
        minSizes,
        availableSize,
        avaialbleSizes
      } as IBlockSizes;
    }

    private ids: string[]
    private panes: HTMLElement[]
    private sizes: Array<number>
    private minSizes: Array<number>
    private onSizeChanged?: (sizes: Array<number>) => void
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

