// @ts-ignore
import layout from './template';
import ItemsControl, { IItemsControlArgs } from 'ember-ux-controls/common/classes/items-control'
import { Axes, IEventEmmiter, Side, Size } from 'ember-ux-controls/common/types';
import { SplitViewPane } from 'ember-ux-controls/components/split-view/pane/component';
import { IContentElement } from 'ember-ux-controls/common/types';
import { notifyPropertyChange } from '@ember/object';
import { action } from '@ember/object';
import { BaseEventArgs } from 'ember-ux-controls/common/classes/event-args';
import { DragMoveSensorEventArgs, DragStartSensorEventArgs, DragStopSensorEventArgs } from 'ember-ux-controls/common/classes/concrete-sensors/drag-mouse-sensor';
import { getOwner } from '@ember/application';
import { computed } from '@ember/object';
import children from 'ember-ux-controls/utils/dom/children';
import find from 'ember-ux-controls/utils/dom/find';
import addClass from 'ember-ux-controls/utils/dom/add-class';
import css from 'ember-ux-controls/utils/dom/css';
import appendTo from 'ember-ux-controls/utils/dom/append-to';
import rect from 'ember-ux-controls/utils/dom/rect';
import { ClassNamesDriver } from 'ember-ux-controls/utils/bem';
import { camelize } from '@ember/string';
import closest from 'ember-ux-controls/utils/dom/closest';
import hasClass from 'ember-ux-controls/utils/dom/has-class';
import DragSensor from 'ember-ux-controls/common/classes/drag-sensor';
import bem from 'ember-ux-controls/utils/bem';

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
  scheme: Array<string | Array<string>>,
  startPosition: number,
  startOffset: number,
  previous: string,
  next: string,
  decorator?: HTMLElement
}


export class SplitView<T extends ISplitViewArgs> extends ItemsControl<T> {
  constructor(
    owner: any,
    args: T
  ) {
    super(owner, args);

    this.globalEventEmmiter.addEventListener(this, DragStartSensorEventArgs, this.dragStart);
    this.globalEventEmmiter.addEventListener(this, DragMoveSensorEventArgs, this.dragMove);
    this.globalEventEmmiter.addEventListener(this, DragStopSensorEventArgs, this.dragStop);

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

  @computed('axis')
  public get sizeTarget() {
    return this.axis === Axes.X
      ? Size.Width
      : Size.Height;
  }

  @computed('sizeTarget')
  public get maxSizeTarget()
    : string {
    return camelize('max-' + this.sizeTarget);
  }

  @computed('axis')
  public get sideOrigin() {
    return this.axis === Axes.X
      ? Side.Left
      : Side.Top;
  }

  @computed('axis')
  public get sideTarget() {
    return this.axis === Axes.X
      ? Side.Right
      : Side.Bottom;
  }

  @computed('axis')
  private get classNamesBuilder() {
    return bem('split-view', `$${this.axis}`);
  }

  @computed('classNamesBuilder')
  public get classNames() {
    return `${this.classNamesBuilder}`;
  }

  public get sizes(): Array<number> {
    return this._sizes ?? [];
  }

  public set sizes(value: Array<number>) {
    if (this._sizes !== value) {
      this._sizes = value;
    }
  }

  public get ids() {
    return this._ids ?? [];
  }

  public set ids(value: Array<string>) {
    if (this._ids !== value) {
      this._ids = value;
    }
  }

  public get panes() {
    return this._panes ?? [];
  }

  public set panes(value: Array<HTMLElement>) {
    if (this._panes !== value) {
      this._panes = value;
    }
  }

  public get minSizes(): Array<number> {
    return this._minSizes ?? []
  }

  public set minSizes(value: Array<number>) {
    if (this._minSizes !== value) {
      this._minSizes = value;
    }
  }

  public get dragData() {
    return this._dragData;
  }

  public set dragData(value: IDrag | undefined) {
    if (this._dragData !== value) {
      this._dragData = value;
    }
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

    result = item instanceof SplitViewPane || item instanceof SplitViewPaneModel;

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

  public onSizeChanged() {
    let
      sizes: Array<number>

    sizes = this.sizes.slice();

    if (typeof this.args.onSizeChanged === 'function') {
      this.args.onSizeChanged(sizes);
    }

    this.eventEmmiter.emitEvent(this, SplitViewPaneSizeChangedEventArgs, sizes);
  }

  @action
  public didInsert(
    element: HTMLElement
  ) {
    this._html = element;

    this.setupIds(element);
    this.setupPanes(element);

    this.calcSizes();
    this.calcMinSizes();
    this.applySizes();
    this.onSizeChanged()
  }

  @action
  public didUpdateAttrs() {
    this.clearSizes();

    this.calcSizes();
    this.calcMinSizes();
    this.applySizes();
    this.onSizeChanged()
  }

  public willDestroy() {
    super.willDestroy();

    this.globalEventEmmiter.removeEventListener(this, DragStartSensorEventArgs, this.dragStart);
    this.globalEventEmmiter.removeEventListener(this, DragMoveSensorEventArgs, this.dragMove);
    this.globalEventEmmiter.removeEventListener(this, DragStopSensorEventArgs, this.dragStop);

  }

  public dragStart(
    _sender: DragSensor,
    args: DragStartSensorEventArgs
  ) {
    let
      next: string,
      target: unknown,
      previous: string,
      scheme: (string | string[])[],
      startOffset: number,
      clientAxis: number,
      decorator: HTMLElement | undefined;

    target = args.dragginTarget;

    if (!(target instanceof Element) || !this.html) {
      return;
    }

    if (!this.checkTarget(this.html, target)) {
      return;
    }

    if (
      !target.nextElementSibling ||
      !target.previousElementSibling
    ) {
      return;
    }

    next = target.nextElementSibling.id;
    previous = target.previousElementSibling.id;

    scheme = this.split(
      [previous, next],
      this.responsive
    );

    if (!this.fluent) {
      decorator = this.createDecorator();
      appendTo(target, decorator);
    }

    if (this.axis === Axes.X) {
      clientAxis = args.clientX;
    } else {
      clientAxis = args.clientY;
    }

    if (this.axis === Axes.X) {
      startOffset = args.offsetX;
    } else {
      startOffset = args.offsetY;
    }

    this.dragData = new SplitView.DragData(
      scheme,
      clientAxis,
      startOffset,
      previous,
      next,
      decorator
    );
  }

  public dragMove(
    _sender: DragSensor,
    args: DragMoveSensorEventArgs
  ) {
    let
      target: Element,
      clientAxis: number;

    target = args.dragginTarget as Element;

    if (!this.html) {
      throw 'Element not found'
    }

    if (!this.checkTarget(this.html, target)) {
      return;
    }

    if (this.axis === Axes.X) {
      clientAxis = args.clientX;
    } else {
      clientAxis = args.clientY;
    }

    this.arrange(this.html, clientAxis);

    args.preventDefault();
  }

  public dragStop(
    _sender: DragSensor,
    args: DragStopSensorEventArgs
  ) {
    let
      currentPosition: number,
      portSize: number,
      target: Element,
      offset: number;

    if (!this.dragData || !this.html) {
      return;
    }

    target = args.dragginTarget as Element;

    if (!this.checkTarget(this.html, target)) {
      return;
    }

    if (this.axis === Axes.X) {
      currentPosition = args.clientX;
    } else {
      currentPosition = args.clientY;
    }

    portSize = rect(this.html)[this.sizeTarget];

    offset = currentPosition - this.dragData.startPosition;

    if (!this.fluent) {
      this.measure(
        portSize,
        offset,
        this.dragData.scheme
      );

      this.removeDecorator();
      this.applySizes();
    }

    args.preventDefault();
  }

  private createDecorator()
    : HTMLElement {
    let
      decorator: HTMLElement,
      className: string;

    decorator = document.createElement('div');
    className = `${this.classNamesBuilder('decorator')}`;

    addClass(
      decorator,
      className
    );

    return decorator;
  }

  private removeDecorator() {
    if (
      this.dragData &&
      this.dragData.decorator
    ) {
      this.dragData.decorator.remove();
      this.dragData.decorator = void 0;
    }
  }

  private checkTarget(
    port: Element,
    target: Element
  ) {
    let
      classes: ClassNamesDriver;

    classes = this.classNamesBuilder('bar', '@fixed');
    //if not bar
    if (!hasClass(target, classes.base)) return false;
    //if fixed
    if (hasClass(target, classes.names[0])) return false;
    //if is not current splitview
    if (!closest(target, port)) return false;

    return true;
  }

  public measure(
    portSize: number,
    offset: number,
    scheme: Array<string | Array<string>>
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
    blocks = this.blocks(scheme)
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

    this.onSizeChanged();
  }

  private arrange(
    port: HTMLElement,
    clientAxis: number
  ): void {
    let
      portRect: DOMRect,
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

    if (!this.dragData) {
      return;
    }

    portRect = rect(port);
    offset = clientAxis - this.dragData.startPosition;
    portSize = portRect[this.sizeTarget];
    positive = offset >= 0;
    offsetStart = portRect[this.sideOrigin];
    pair = [this.dragData.previous, this.dragData.next];
    edges = this.edges(portSize, offsetStart, pair);
    max = Math.max(...edges);
    min = Math.min(...edges);

    // if fluent we no need to resize decorator.
    if (this.fluent) {
      startPosition = clientAxis;
      this.measure(portSize, offset, this.dragData.scheme);
      this.applySizes();
      if (
        startPosition > max - (this.barSize - this.dragData.startOffset) ||
        startPosition < min + this.dragData.startOffset
      ) {
        startPosition = positive
          ? max - (this.barSize - this.dragData.startOffset)
          : min + this.dragData.startOffset
      }
      this.dragData.startPosition = startPosition;
    } else {
      blocks = this.blocks(this.dragData.scheme);
      absBlockSizes = this.absoluteBlockSizes(
        portSize,
        blocks[~~positive]
      );
      size = Math.min(
        Math.abs(offset),
        absBlockSizes.availableSize
      );

      if (this.dragData.decorator) {
        css(this.dragData.decorator, {
          [this.sideOrigin]: positive ? this.barSize + 'px' : 'auto',
          [this.sideTarget]: positive ? 'auto' : this.barSize + 'px',
          [this.sizeTarget]: size + 'px'
        });
      }
    }
  }

  private setupIds(element: HTMLElement) {
    this.ids = children(
      element,
      `.${this.classNamesBuilder('pane')}`
    ).map((e: Element) => e.id);
  }

  private setupPanes(element: HTMLElement) {
    this.panes = this.ids.map(id =>
      find(element, `#${id}`)[0]
    ) as HTMLElement[];
  }

  private calcSizes() {
    this.sizes = this.args.sizes ?? this.ids.map(() =>
      100 / this.ids.length
    );
  }

  private calcBarSize() {
    return this.barSize * (this.ids.length - 1) / this.ids.length;
  }

  private calcMinSizes() {
    if (Array.isArray(this.args.minSizes)) {
      this.minSizes = this.args.minSizes;
    }
    this.minSizes = this.ids.map(() => this.minSize);
  }

  private clearSizes() {
    let
      style: { [K in Size]?: string },
      idx: number;

    style = {};

    for (
      idx = 0;
      idx < this.panes.length;
      idx++
    ) {
      style[Size.Height] = 'inherit';
      style[Size.Width] = 'inherit';
      css(this.panes[idx], style);
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
      style[this.sizeTarget] = `calc(${size}% - ${this.calcBarSize()}px)`;
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
    scheme: Array<string | Array<string>>
  ): Array<Array<string>> {
    let
      result: string[][]

    result = this.responsive
      // if responsive scheme will be array of arrays
      ? scheme.slice() as Array<Array<string>>
      // else needs leave only arrays
      : scheme.filter(b =>
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

  private static DragData = class implements IDrag {
    constructor(
      public scheme: Array<string | Array<string>>,
      public startPosition: number,
      public startOffset: number,
      public previous: string,
      public next: string,
      public decorator?: HTMLElement
    ) { }
  }

  private _dragData?: IDrag
  private _html?: HTMLElement
  private _globalEventEmmiter?: IEventEmmiter
  private _ids?: Array<string>
  private _panes?: Array<HTMLElement>
  private _sizes?: Array<number>
  private _minSizes?: Array<number>
}

function isContentElement(
  obj: unknown
): obj is IContentElement {
  return (
    typeof (<IContentElement>obj).content !== 'undefined'
  );
}

export default SplitView.RegisterTemplate(layout)

