// @ts-ignore
import { setModifierManager, capabilities } from '@ember/modifier';
import hasClass from 'ember-ux-core/utils/dom/has-class';
import addClass from 'ember-ux-core/utils/dom/add-class';
import removeClass from 'ember-ux-core/utils/dom/remove-class';
import css from 'ember-ux-core/utils/dom/css';
import find from 'ember-ux-core/utils/dom/find';
import on from 'ember-ux-core/utils/dom/on';
import off from 'ember-ux-core/utils/dom/off';
import { scheduleOnce } from '@ember/runloop';
import setReadOnly from 'ember-ux-core/utils/set-read-only';
import rect from 'ember-ux-core/utils/dom/rect';
import Modifier from 'ember-ux-core/modifiers/base-modifier';

import {
  Axes,
  ISize,
  IPointer
} from 'ember-ux-core/common/types';

import {
  IOffset,
  IDimensions
} from 'ember-ux-controls/common/types';

import {
  IScrollPortArgs, ScrollPort
} from 'ember-ux-controls/components/scroll-port/component';
import { ClassNamesBuilder } from 'ember-ux-core/utils/bem';

const
  //'onorientationchange' don't update width and height 
  __changePortSizesEvents = [
    'resize',
    'resize.split-view'
  ].join(' '),
  __startMoveEvents = [
    'mousedown',
    'touchstart'
  ].join(' '),
  __scrollEvents = [
    'wheel'
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

/**
  @method split-view
  @public
*/

interface IScrollPortBehaviorArgs extends IScrollPortArgs {
  classNamesBuilder?: ClassNamesBuilder
}

export default class ScrollPortModifier extends Modifier {
  private behavior: ScrollPortBehavior | null = null
  constructor(
    owner: any,
    args: any
  ) {
    super(owner, args);

    this.didInsert = () => {
      if (this.element === null) {
        return;
      }

      this.behavior = new ScrollPortBehavior(
        this.element,
        this.args.named
      )
    }

    this.didUpdate = () => {
      if(!this.behavior) {
        return;
      }

      this.behavior.update();
    }

    //TODO: set didUpdate
    this.willRemove = () => {
      if (this.behavior !== null) {
        this.behavior.deactivate();
        this.behavior = null;
      }
    }
  }
}

class ScrollPortBehavior {
  private screen: HTMLElement
  private contentX: Array<HTMLElement>
  private contentY: Array<HTMLElement>
  private barX: HTMLElement
  private barY: HTMLElement
  private dimensions: Readonly<IDimensions> | null = null
  private scrollEventHandler: () => void
  private resizeEventHandler: () => void
  private startDragEventHandler: () => void

  constructor(
    private port: HTMLElement,
    private args: IScrollPortBehaviorArgs
  ) {
    let
      bars: Array<Element>;

    this.screen = find(
      port,
      `.${this.classNamesBuilder('screen')}`
    )[0] as HTMLElement;

    this.contentX = find(
      port,
      `.${this.classNamesBuilder('content', `$${Axes.X}`).names[0]}`
    ) as HTMLElement[];

    this.contentY = find(
      port,
      `.${this.classNamesBuilder('content', `$${Axes.Y}`).names[0]}`
    ) as HTMLElement[];

    bars = find(port, `.${this.classNamesBuilder('bar')}`);

    this.barX = bars.find(bar =>
      hasClass(bar, `${this.classNamesBuilder('bar', `$${Axes.X}`).names[0]}`)
    ) as HTMLElement;

    this.barY = bars.find(bar =>
      hasClass(bar, `${this.classNamesBuilder('bar', `$${Axes.Y}`).names[0]}`)
    ) as HTMLElement;

    this.startDragEventHandler = this.onStartDrag.bind(this)
    this.resizeEventHandler = this.onResize.bind(this);
    this.scrollEventHandler = this.onScroll.bind(this);

    on([this.barX, this.barY], __startMoveEvents, this.startDragEventHandler);

    on(window, __changePortSizesEvents, this.resizeEventHandler);

    on(port, __scrollEvents, this.scrollEventHandler);

    this.update();
  }

  bar: Bar | null = null

  get classNamesBuilder() {
    if (this.parentElement instanceof ScrollPort) {
      return this.parentElement.classNamesBuilder;
    }

    if (this.args.classNamesBuilder) {
      return this.args.classNamesBuilder;
    }

    throw new Error('ClassNamesBuilder required');
  }

  get portOffset() {
    let
      port: HTMLElement | null,
      offset: IOffset,
      portRect: DOMRect;

    port = this.port;
    offset = {
      left: 0,
      top: 0
    }

    if (port !== null) {
      portRect = rect(port);
      offset.left = portRect.left;
      offset.top = portRect.top;
    }

    return offset;
  }

  get delta() {
    return this.args.delta ?? 50;
  }

  get scrollAxis() {
    return this.args.scrollAxis;
  }

  get parentElement() {
    return this.args.parentElement;
  }

  get scrollX() {
    return this.dimensions?.scrollX ?? 0
  }

  get scrollY() {
    return this.dimensions?.scrollY ?? 0
  }

  get maxScrollX() {
    return this.dimensions?.maxScrollX ?? 0
  }

  get maxScrollY() {
    return this.dimensions?.maxScrollY ?? 0
  }

  get ratioX() {
    return this.dimensions?.ratioX ?? 1
  }

  get ratioY() {
    return this.dimensions?.ratioY ?? 1
  }

  get hasContextX() {
    return this.contentX?.length > 0 ?? 0;
  }

  get hasContextY() {
    return this.contentY?.length > 0 ?? 0;
  }

  get contentSizes(): ISize {
    let
      horizontalContent: HTMLElement[],
      verticalContent: HTMLElement[],
      size: ISize;

    horizontalContent = this.contentX;
    verticalContent = this.contentY;
    size = {
      width: 0,
      height: 0
    };

    if (horizontalContent) {
      size.width = Math.max.apply(Math, horizontalContent.map((e) =>
        e.scrollWidth + e.offsetLeft)
      )
    }

    if (verticalContent) {
      size.height = Math.max.apply(Math, verticalContent.map((e) =>
        e.scrollHeight + e.offsetTop)
      )
    }

    return size;
  }

  get screenSizes(): ISize {
    let
      size: ISize;

    size = {
      width: 0,
      height: 0
    };

    if (this.screen !== null && this.port !== null) {
      size.height = Math.round(
        Math.min(
          this.screen.offsetHeight,
          this.port.offsetHeight
        )
      );

      size.width = Math.round(
        Math.min(
          this.screen.offsetWidth,
          this.port.offsetWidth
        )
      );
    }

    return size
  }

  public update(){
    scheduleOnce('afterRender', this, () => {
      this.measure();
      this.render();
    })
  }

  public deactivate() {
    if (this.bar) {
      this.bar.deactivate();
      this.bar = null;
    }

    off(
      window,
      __changePortSizesEvents,
      this.resizeEventHandler
    );

    off(
      window,
      __scrollEvents,
      this.scrollEventHandler
    );

    off(
      [this.barX, this.barY],
      __startMoveEvents,
      this.startDragEventHandler
    )
  }

  /**
  * Measure sizes of content and bars
  */
  private measure(): void {
    const
      dimensions = {} as Readonly<IDimensions>;

    setReadOnly(dimensions, 'portOffset', this.portOffset);

    setReadOnly(dimensions, 'contentSize', this.contentSizes);

    setReadOnly(dimensions, 'screenSize', this.screenSizes);

    setReadOnly(dimensions, 'isX', ({ contentSize, screenSize }) =>
      contentSize.width > screenSize.width
    );

    setReadOnly(dimensions, 'isY', ({ contentSize, screenSize }) =>
      contentSize.height > screenSize.height
    );

    setReadOnly(dimensions, 'ratioX', ({ contentSize, screenSize }) =>
      contentSize.width > 0 && screenSize.width > 0
        ? screenSize.width / contentSize.width
        : 1
    );

    setReadOnly(dimensions, 'ratioY', ({ contentSize, screenSize }) =>
      contentSize.height > 0 && screenSize.height > 0
        ? screenSize.height / contentSize.height
        : 1
    );

    setReadOnly(dimensions, 'barSizeX', ({ screenSize, ratioX }) =>
      screenSize.width * ratioX
    );

    setReadOnly(dimensions, 'barSizeY', ({ screenSize, ratioY }) =>
      screenSize.height * ratioY
    );

    setReadOnly(dimensions, 'maxScrollX', ({ screenSize, ratioX }) =>
      Math.max(screenSize.width - screenSize.width * ratioX, 0)
    );

    setReadOnly(dimensions, 'maxScrollY', ({ screenSize, ratioY }) =>
      Math.max(screenSize.height - screenSize.height * ratioY, 0)
    );

    setReadOnly(dimensions, 'scrollX', ({ ratioX, maxScrollX }) =>
      Math.min(this.scrollX * ratioX / this.ratioX, maxScrollX)
    );

    setReadOnly(dimensions, 'scrollY', ({ ratioY, maxScrollY }) =>
      Math.min(this.scrollY * ratioY / this.ratioY, maxScrollY)
    );

    this.updatePublicProperties(dimensions);

    this.dimensions = dimensions;
  }

  private updatePublicProperties(
    dim: Readonly<IDimensions>
  ) {
    if (this.parentElement instanceof ScrollPort) {
      this.parentElement.isX = dim.isX;
      this.parentElement.isY = dim.isY;
    }
  }

  private onMouseMove(
    event: MouseEvent | TouchEvent
  ): void {
    let
      isX: boolean,
      clientAxis: number,
      maxScroll: number;

    if (this.bar === null) {
      return;
    }

    if (this.dimensions) {
      isX = this.bar.axis === Axes.X;
      clientAxis = this.clientAxis(
        this.bar.axis,
        event
      );
      maxScroll = isX
        ? this.maxScrollX
        : this.maxScrollY;

      this.bar.measure(
        clientAxis,
        maxScroll
      );

      setReadOnly(
        this.dimensions,
        isX
          ? 'scrollX'
          : 'scrollY',
        this.bar.scroll
      )
    }

    scheduleOnce('afterRender', this, this.render);
  }

  private onStartDrag(
    event: MouseEvent | TouchEvent
  ): void {
    let
      dimensions: Readonly<IDimensions> | null,
      bar: Element,
      axis: Axes | null,
      pointer: IPointer,
      isX: boolean,
      scroll: number,
      portOffset: number;

    dimensions = this.dimensions;
    bar = event.target as Element;
    axis = hasClass(
      bar,
      `${this.classNamesBuilder('bar', `$${Axes.X}`).names[0]}`
    )
      ? Axes.X
      : hasClass(
        bar,
        `${this.classNamesBuilder('bar', `$${Axes.Y}`).names[0]}`
      )
        ? Axes.Y
        : null;

    if (
      dimensions !== null &&
      axis !== null
    ) {
      pointer = {
        position: this.clientAxis(axis, event),
        offset: this.pointerOffset(axis, event)
      } as IPointer;
      isX = axis === Axes.X;
      scroll = isX
        ? this.scrollX
        : this.scrollY;
      portOffset = isX
        ? dimensions.portOffset.left
        : dimensions.portOffset.top;

      this.bar = new Bar(
        bar,
        axis,
        pointer,
        scroll,
        portOffset,
        this.classNamesBuilder,
        this.onMouseMove.bind(this),
        this.onMouseUp.bind(this)
      );
    }
  }

  private onMouseUp(): boolean {
    if (this.bar) {
      this.bar.deactivate();
      this.bar = null
    }
    return false;
  }

  private onResize() {
    scheduleOnce(
      'afterRender',
      this,
      () => {
        this.measure();
        this.render();
      });
  }

  private onScroll(event: WheelEvent) {
    this.scroll(
      event.deltaX,
      event.deltaY
    );
  }

  /**
   * Apply sizes for contents
   */
  private render(): void {
    const
      dimensions = this.dimensions;

    if (dimensions === null) {
      return;
    }

    if (this.contentX !== null) {
      this.contentX.map(cx =>
        cx.scrollLeft = dimensions.scrollX / dimensions.ratioX
      );
    }

    if (this.contentY != null) {
      this.contentY.map(cy =>
        cy.scrollTop = dimensions.scrollY / dimensions.ratioY
      );
    }

    if (this.barX !== null) {
      //apply horizontal bar size
      css(this.barX, {
        'width': dimensions.barSizeX + 'px',
        'left': dimensions.scrollX + 'px'
      });
    }

    if (this.barY !== null) {
      //apply vertical bar size
      css(this.barY, {
        'height': dimensions.barSizeY + 'px',
        'top': dimensions.scrollY + 'px'
      });
    }
  }

  private scroll(_: number, deltaY: number)
  : void {
    if (this.dimensions !== null) {
      if (this.scrollAxis === Axes.X) {
        if (this.hasContextX && deltaY) {
          setReadOnly(
            this.dimensions,
            'scrollX',
            this.calculateDelta(
              deltaY,
              this.dimensions.scrollX,
              this.dimensions.maxScrollX
            )
          )
        }
      } else if (this.hasContextY && deltaY) {
        setReadOnly(
          this.dimensions,
          'scrollY',
          this.calculateDelta(
            deltaY,
            this.dimensions.scrollY,
            this.dimensions.maxScrollY
          )
        );
      }
    }

    scheduleOnce('afterRender', this, this.render);
  }

  private calculateDelta(
    delta: number,
    scroll: number,
    maxScroll: number
  ): number {
    const
      target = Math.sign(delta) * this.delta;

    return Math.min(
      Math.max(scroll + target, 0),
      maxScroll
    );
  }

  private clientAxis(
    axis: Axes, event: MouseEvent | TouchEvent
  ): number {
    let
      isX: boolean,
      firstTouch: Touch;

    isX = axis === Axes.X

    if (event instanceof MouseEvent) {
      return isX
        ? event.clientX
        : event.clientY;
    }

    firstTouch = event.touches[0];

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

    firstTouch = event.touches[0];
    targetRect = rect(
      firstTouch.target as HTMLElement
    );

    return isX
      ? firstTouch.clientX - targetRect.left
      : firstTouch.clientY - targetRect.top;
  }
}

class Bar {
  constructor(
    public bar: Element,
    public axis: Axes,
    public pointer: Readonly<IPointer>,
    public scroll: number,
    public portOffset: number,
    public classNamesBuilder: ClassNamesBuilder,
    public dragEventHandler: () => void,
    public drargEndEventHandler: () => void
  ) {
    on(
      document,
      __moveEvents,
      this.dragEventHandler
    );
    on(
      document,
      __endMoveEvents,
      this.drargEndEventHandler
    );

    addClass(
      this.bar,
      `${this.classNamesBuilder('bar', '$grabbed').names[0]}`
    );
  }

  measure(
    currentPointerPosition: number,
    maxScroll: number
  ) {
    this.scroll = Math.max(
      Math.min(
        this.scroll + currentPointerPosition - this.pointer.position, maxScroll
      ), 0
    );

    if (this.scroll <= 0) {
      setReadOnly(
        this.pointer,
        "position",
        this.portOffset + this.pointer.offset
      );
    } else if (this.scroll >= maxScroll) {
      setReadOnly(
        this.pointer,
        "position",
        this.portOffset + maxScroll + this.pointer.offset
      );
    } else {
      setReadOnly(
        this.pointer,
        "position",
        currentPointerPosition
      );
    }
  }

  deactivate() {
    removeClass(
      this.bar,
      `${this.classNamesBuilder('bar', '$grabbed').names[0]}`
    );

    off(
      document,
      __moveEvents,
      this.dragEventHandler
    );

    off(
      document,
      __endMoveEvents,
      this.drargEndEventHandler
    );
  }
}