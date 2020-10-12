import children from 'ember-ux-controls/utils/dom/children';
import find from 'ember-ux-controls/utils/dom/find';
import on from 'ember-ux-controls/utils/dom/on';
import off from 'ember-ux-controls/utils/dom/off';
import css from 'ember-ux-controls/utils/dom/css';
import hasClass from 'ember-ux-controls/utils/dom/has-class';
import appendTo from 'ember-ux-controls/utils/dom/append-to';
import addClass from 'ember-ux-controls/utils/dom/add-class';
import setReadOnly from 'ember-ux-controls/utils/set-read-only';
import rect from 'ember-ux-controls/utils/dom/rect';
import Modifier from 'ember-modifier';
import { scheduleOnce } from '@ember/runloop';
import { camelize } from '@ember/string';

import {
  Side,
  Axes,
  IPointer,
  Size,
  GeneratorStatus
} from 'ember-ux-controls/common/types';

import {
  ISplitViewArgs,
  SplitView
} from '../components/split-view/component';
import { ItemContainerGeneratorStatusChangedEventArgs } from 'ember-ux-controls/common/classes/-private/item-container-generator';
import bem, { ClassNamesBuilder } from 'ember-ux-controls/utils/bem';
import ItemsControl from 'dummy/classes/items-control';

interface ISplitViewModifierArgs extends ISplitViewArgs {
  host: unknown
  blockClassName?: string
  elementClassName?: string
  classNamesBuilder: ClassNamesBuilder
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

interface IBlockSizes {
  size: number,
  minSize: number
  sizes: Array<number>,
  minSizes: Array<number>,
  avaialbleSizes: Array<number>,
  availableSize: number
}

const
  __startEvents = [
    'mousedown',
    'touchstart'
  ].join(' '),
  __moveEvents = [
    'mousemove',
    'touchmove'
  ].join(' '),
  __endMoveEvents = [
    'mouseup',
    'touchend',
    'touchcancel'
  ].join(' ');

export default class SplitViewModifier extends Modifier {
  private behavior: SplitViewBehavior | null = null

  public didInstall() {
    if (
      !(this.element instanceof HTMLElement)
    ) {
      return;
    }

    this.behavior = new SplitViewBehavior(
      this.element,
      this.args.named
    );

    this.behavior.subscribe();
  }

  public didUpdateArguments() {
    if (this.behavior) {
      this.behavior.update(this.args.named);
    }
  }

  public willRemove() {
    if (this.behavior !== null) {
      this.behavior.unsubscribe(true);
      this.behavior = null;
    }
  }
}

export class SplitViewBehavior {
  private drag: Readonly<IDrag> | null = null
  private bars: Array<HTMLElement> = []
  private ids: Array<string> = []
  private panes: Array<HTMLElement> = []
  private sizes: Array<number> = []
  private calcBarSize: number = 0
  private minSizes: Array<number> = []
  private startMoveHandler: () => void
  private moveHandler: () => void
  private endMoveHandler: () => void

  constructor(
    private element: HTMLElement,
    private args: Record<string, unknown>
  ) {
    this.setupPanes();
    this.computeSizes();

    this.startMoveHandler = this.onStartMove.bind(this);
    this.moveHandler = this.onMove.bind(this);
    this.endMoveHandler = this.onEndMove.bind(this);

    this.setupBars();
    this.applySizes();
  }

  get host()
    : unknown {
    return this.getProperty('host');
  }

  get axis()
    : Axes {
    return this.getProperty('axis', Axes.X);
  }

  get blockClassName() {
    return this.getProperty('blockClassName', 'split-view');
  }

  get elementClassName() {
    return this.getProperty('elementClassName', 'pane');
  }

  get classNamesBuilder()
    : ClassNamesBuilder {
    return this.getProperty('classNamesBuilder', () => bem(this.blockClassName));
  }

  get barSize()
    : number {
    return this.getProperty('barSize', 3);
  }

  get fluent()
    : boolean {
    return this.getProperty('fluent', false);
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

  get minSize()
    : number {
    return this.getProperty('minSize', 0);
  }

  get responsive()
    : boolean {
    return this.getProperty('responsive', false);
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

  get onSizeChanged() {
    return this.getProperty('onSizeChanged', () => () => { });
  }

  public subscribe() {
    if (this.host instanceof SplitView) {
      this.host.addEventListener(
        this, ItemContainerGeneratorStatusChangedEventArgs, this.onGeneratorStatusChanged
      );
    }
  }

  public update(
    args = this.args
  ) {
    this.args = args;

    this.setupPanes();
    this.computeSizes();
    this.clearBars();
    this.setupBars();
    this.clearSizes();
    this.applySizes();
  }

  public unsubscribe(
    willRemove = false
  ): void {
    if (this.drag) {
      off(document, __moveEvents, this.moveHandler);
      off(document, __endMoveEvents, this.endMoveHandler);
      this.drag = null;
    }

    if (willRemove === true) {
      off(
        find(
          this.element,
          `.${this.classNamesBuilder('bar')}`
        ), __startEvents,
        this.startMoveHandler
      );

      if (
        this.host instanceof ItemsControl
      ) {
        this.host.removeEventListener(
          this,
          ItemContainerGeneratorStatusChangedEventArgs,
          this.onGeneratorStatusChanged
        );
      }
    }
  }

  private onGeneratorStatusChanged(
    _: object,
    args: ItemContainerGeneratorStatusChangedEventArgs
  ): void {
    if (
      this.host instanceof ItemsControl &&
      args.newStatus === GeneratorStatus.ContainersGenerated
    ) {
      scheduleOnce('afterRender', this, this.update)
    }
  }

  private setupPanes() {
    this.ids = children(
      this.element,
      `.${this.classNamesBuilder(this.elementClassName)}`
    ).map((e: Element) => e.id);

    this.panes = [...this.ids.map(id =>
      find(this.element, `#${id}`)[0]
    )] as HTMLElement[];
  }

  private clearBars() {
    let
      bar: Element;

    if (this.bars.length === 0) {
      return
    }

    for (bar of this.bars) {
      off(bar, __startEvents, this.startMoveHandler);
      bar.remove();
    }

    this.bars.length = 0;
  }

  private setupBars(
  ): void {
    let
      pane: HTMLElement | null = null,
      count: number,
      index: number,
      bar: HTMLDivElement;

    for (
      index = 0,
      count = this.panes.length;
      index < count;
      index++
    ) {
      pane = this.panes[index];
      if (index < this.panes.length - 1) {
        bar = document.createElement('div');

        addClass(bar, `${this.classNamesBuilder('bar', {
          [`$${this.axis}`]: true
        })}`);

        on(bar, __startEvents, this.startMoveHandler);

        css(bar, {
          [this.sizeTarget]: `${this.barSize}px`
        });

        // add bar after pane (before next pane)
        appendTo(
          this.element,
          bar,
          pane.nextSibling
        );

        this.bars.push(bar);
      }
    }
  }

  private computeSizes() {
    this.calcBarSize = this.barSize * (this.ids.length - 1) / this.ids.length;
    this.minSizes = this.getProperty('minSizes', this.ids.map(() =>
      this.minSize
    ));
    this.sizes = this.getProperty('sizes', this.ids.map(() =>
      100 / this.ids.length
    ));

    this.onSizeChanged(this.sizes.slice());
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
      style[this.sizeTarget] = `calc(${size}% - ${this.calcBarSize}px)`;
      css(this.panes[idx], style);
    }
  }

  private activate(
    bar: HTMLElement,
    pointer: IPointer
  ) {
    let
      startPosition: number,
      startOffset: number,
      next: string,
      previous: string,
      layout: (string | string[])[],
      drag: Readonly<IDrag>,
      decorator: HTMLDivElement,
      fixedClassName: string;

    fixedClassName = `${this.classNamesBuilder(this.elementClassName, '$fixed').names[0]}`;

    if (hasClass(bar.previousSibling! as Element,
      fixedClassName
    )) {
      return;
    }

    startPosition = pointer.position;
    startOffset = pointer.offset;
    next = bar.nextElementSibling!.id;
    previous = bar.previousElementSibling!.id;
    drag = {} as IDrag;
    layout = this.split(
      [previous, next],
      this.responsive
    );

    if (!this.fluent) {
      decorator = document.createElement('div');
      addClass(decorator, `${this.classNamesBuilder('decorator')}`);
      appendTo(bar, decorator);
      setReadOnly(drag, 'decorator', decorator);
    }

    setReadOnly(drag, 'layout', layout);
    setReadOnly(drag, 'next', next);
    setReadOnly(drag, 'previous', previous);
    setReadOnly(drag, 'startPosition', startPosition);
    setReadOnly(drag, 'startOffset', startOffset);

    on(document, __moveEvents, this.moveHandler);
    on(document, __endMoveEvents, this.endMoveHandler);

    this.drag = drag;
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

    this.onSizeChanged(this.sizes.slice());
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
      Math.max(size * portSize / 100, this.calcBarSize)
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
        (a, b) => a + b - this.calcBarSize,
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
        b instanceof Array
        ) as Array<Array<string>>;

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
      Math.max(this.minSizes[index] * portSize / 100, this.calcBarSize));
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

  private onEndMove(
    event: MouseEvent | TouchEvent
  ) {
    let
      currentPosition: number,
      portSize: number,
      offset: number;

    if (this.drag === null) {
      return;
    }

    currentPosition = this.clientAxis(this.axis, event);
    portSize = rect(this.element)[this.sizeTarget];
    offset = currentPosition - this.drag.startPosition;

    if (!this.fluent) {
      this.measure(
        portSize,
        offset,
        this.drag.layout
      );
      this.applySizes();
      this.drag.decorator.remove();
    }

    this.unsubscribe();
    event.preventDefault();
  }

  private onMove(
    event: MouseEvent | TouchEvent
  ): void {
    let
      pointer: IPointer

    pointer = {
      position: this.clientAxis(this.axis, event),
      offset: this.pointerOffset(this.axis, event)
    }

    this.arrange(
      pointer
    );

    event.preventDefault();
  }

  private onStartMove(
    event: MouseEvent | TouchEvent
  ): void {
    let
      target: HTMLElement,
      pointer: IPointer;

    target = event.target as HTMLElement;
    pointer = {
      position: this.clientAxis(
        this.axis,
        event
      ),
      offset: this.pointerOffset(
        this.axis,
        event
      )
    };

    this.activate(
      target,
      pointer
    )

    event.preventDefault();
  }

  private clientAxis(
    axis: Axes,
    event: MouseEvent | TouchEvent
  ): number {
    let
      isX: boolean,
      firstTouch: Touch;

    isX = axis === Axes.X;

    if (event instanceof MouseEvent) {
      return isX
        ? event.clientX
        : event.clientY;
    }

    firstTouch = event.touches[0] ?? event.changedTouches[0];

    return isX
      ? firstTouch.clientX
      : firstTouch.clientY;
  }

  private pointerOffset(
    axis: Axes, event: MouseEvent | TouchEvent
  ): number {
    let
      isX: boolean,
      firstTouch: Touch,
      targetRect: DOMRect;

    isX = axis === Axes.X;

    if (event instanceof MouseEvent) {
      return isX
        ? event.offsetX
        : event.offsetY
    }

    firstTouch = event.touches[0] ?? event.changedTouches[0];
    targetRect = rect(
      firstTouch.target as HTMLElement
    );

    return isX
      ? firstTouch.clientX - targetRect.left
      : firstTouch.clientY - targetRect.top;
  }

  private getProperty<
    T extends ISplitViewModifierArgs,
    K extends keyof { [P in keyof T]-?: T[P] },
    F extends () => T[K]
  >(
    key: K,
    def?: T[K] | F
  )
    : { [P in keyof T]-?: T[P] }[K] {
    let
      result: T[K];

    result = Reflect.get(this.args, key);
    if (typeof result !== 'undefined') {
      return result;
    }

    if (typeof def === 'function') {
      return (def as F)();
    }

    if (typeof def !== 'undefined') {
      return def;
    }

    throw new Error(`${key} was not found and default value was not set`);
  }

}