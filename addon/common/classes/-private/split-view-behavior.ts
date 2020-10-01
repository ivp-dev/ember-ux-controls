import children from 'ember-ux-controls/utils/dom/children';
import find from 'ember-ux-controls/utils/dom/find';
import addClass from 'ember-ux-controls/utils/dom/add-class';
import css from 'ember-ux-controls/utils/dom/css';
import appendTo from 'ember-ux-controls/utils/dom/append-to';
import { Axes, Side, Size } from 'ember-ux-controls/common/types';
import { SplitView, ISplitViewArgs } from 'ember-ux-controls/components/split-view/component';
import rect from 'ember-ux-controls/utils/dom/rect';
import bem, { ClassNamesDriver, ClassNamesBuilder } from 'ember-ux-controls/utils/bem';
import { camelize } from '@ember/string';
import { DragMoveSensorEventArgs, DragStartSensorEventArgs, DragStopSensorEventArgs } from '../concrete-sensors/drag-mouse-sensor';
import closest from 'ember-ux-controls/utils/dom/closest';
import hasClass from 'ember-ux-controls/utils/dom/has-class';
import DragSensor from 'ember-ux-controls/common/classes/drag-sensor';


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
  decorator?: HTMLElement
}

export default class SplitViewBehavior {
  constructor(
    public owner: SplitView<ISplitViewArgs>,
    public element: HTMLElement,
    sizes?: Array<number>,
    minSize?: number,
    minSizes?: Array<number>
  ) {
    this.ids = this.setupIds();
    this.panes = this.setupPanes();
    this.minSizes = this.calcMinSizes(minSize, minSizes);
    this.sizes = this.calcSizes(sizes);
   
    this.applySizes();
    this.notifySizeChanged();
  }

  public get axis()
    : Axes {
    return this.owner.axis
  }

  public get allowMouseSensor() {
    return true;
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

  public get classNamesBuilder()
    : ClassNamesBuilder {
    return bem('split-view');
  }

  public get sizeTarget()
    : Size {
    return this.axis === Axes.X
      ? Size.Width
      : Size.Height;
  }

  public get maxSizeTarget()
    : string {
    return camelize('max-' + this.sizeTarget);
  }

  public get sideOrigin()
    : Side {
    return this.axis === Axes.X
      ? Side.Left
      : Side.Top;
  }

  public get sideTarget()
    : Side {
    return this.axis === Axes.X
      ? Side.Right
      : Side.Bottom;
  }

  public dragStart(
    _: DragSensor,
    args: DragStartSensorEventArgs
  ) {
    let
      next: string,
      target: unknown,
      previous: string,
      layout: (string | string[])[],
      startOffset: number,
      clientAxis: number,
      decorator: HTMLDivElement | undefined;

    target = args.dragginTarget;

    if (!(target instanceof Element)) {
      return;
    }

    if (!this.checkTarget(target)) {
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

    layout = this.split(
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

    this.dragData = new SplitViewBehavior.DragData(
      layout,
      clientAxis,
      startOffset,
      previous,
      next,
      decorator
    );
  }

  public dragMove(
    _: DragSensor,
    args: DragMoveSensorEventArgs
  ) {
    let
      target: Element,
      clientAxis: number;

    target = args.dragginTarget as Element;

    if (!this.checkTarget(target)) {
      return;
    }

    if (this.axis === Axes.X) {
      clientAxis = args.clientX;
    } else {
      clientAxis = args.clientY;
    }

    this.arrange(clientAxis);

    args.preventDefault();
  }

  public dragStop(
    _: DragSensor,
    args: DragStopSensorEventArgs
  ) {
    let
      currentPosition: number,
      portSize: number,
      target: Element,
      offset: number;

    if (!this.dragData) {
      return;
    }

    target = args.dragginTarget as Element;

    if (!this.checkTarget(target)) {
      return;
    }

    if (this.axis === Axes.X) {
      currentPosition = args.clientX;
    } else {
      currentPosition = args.clientY;
    }

    portSize = rect(this.element)[this.sizeTarget];

    offset = currentPosition - this.dragData.startPosition;

    if (!this.fluent) {
      this.measure(
        portSize,
        offset,
        this.dragData.layout
      );

      this.removeDecorator();
      this.applySizes();
    }

    args.preventDefault();
  }

  private notifySizeChanged() {
    this.owner.onSizesChanged(this.sizes.slice());
  }

  private createDecorator()
    : HTMLDivElement {
    let
      decorator: HTMLDivElement;

    decorator = document.createElement('div');
    addClass(decorator, `${this.classNamesBuilder('decorator')}`);
    return decorator;
  }

  private removeDecorator() {
    if (
      this.dragData && 
      this.dragData.decorator
    ) {
      this.dragData.decorator.remove();
    }
  }

  private checkTarget(
    target: Element
  ) {
    let
      classes: ClassNamesDriver;

    classes = this.classNamesBuilder('bar', '@fixed');
    //if not bar
    if (!hasClass(target, classes.base)) return false;
    //if fixed
    if (hasClass(target, classes.names[0])) return false;
    //if not this splitview
    if (!closest(target, this.element)) return false;

    return true;
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

    this.notifySizeChanged();
  }

  private arrange(
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

    portRect = rect(this.element);
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
      this.measure(portSize, offset, this.dragData.layout);
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
      blocks = this.blocks(this.dragData.layout);
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

  private static DragData = class implements IDrag {
    constructor(
      public layout: Array<string | Array<string>>,
      public startPosition: number,
      public startOffset: number,
      public previous: string,
      public next: string,
      public decorator?: HTMLElement
    ) { }
  }

  private dragData?: IDrag
  private ids: string[]
  private panes: HTMLElement[]
  private sizes: Array<number>
  private minSizes: Array<number>
}