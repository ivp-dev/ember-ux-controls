import hasClass from 'ember-ux-controls/utils/dom/has-class';
import addClass from 'ember-ux-controls/utils/dom/add-class';
import removeClass from 'ember-ux-controls/utils/dom/remove-class';
import css from 'ember-ux-controls/utils/dom/css';
import find from 'ember-ux-controls/utils/dom/find';
import on from 'ember-ux-controls/utils/dom/on';
import off from 'ember-ux-controls/utils/dom/off';
import { scheduleOnce } from '@ember/runloop';
import setReadOnly from 'ember-ux-controls/utils/set-read-only';
import rect from 'ember-ux-controls/utils/dom/rect';
import Modifier from 'ember-modifier';
import bem, { ClassNamesBuilder } from 'ember-ux-controls/utils/bem';
import { action } from '@ember/object';

import {
  Axes,
  ISize,
  IPointer
} from 'ember-ux-controls/common/types';

import {
  IOffset,
  IDimensions
} from 'ember-ux-controls/common/types';



const
  //'onorientationchange' don't update width and height 
  __changePortSizesEvents = [
    'resize',
    //'resize.split-view'
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

type UpdatePublicPropertiesCallback = (isX: boolean, isY: boolean) => void

export default class ScrollPortModifier extends Modifier {
  private behavior: ScrollPortBehavior | null = null

  didInstall() {
    this.update();
  }

  didUpdateArguments() {
    this.update();
  }

  update() {
    let
      namedArgs: Record<string, unknown>;

    if (
      this.element === null ||
      !(this.element instanceof HTMLElement)
    ) {
      throw new Error('Element was not set');
    }

    namedArgs = this.args.named;

    if (this.behavior) {
      this.behavior.update(
        namedArgs.delta as number,
        namedArgs.scrollAxis as Axes,
      );
      return;
    }

    this.behavior = new ScrollPortBehavior(
      this.element,
      namedArgs.delta as number,
      namedArgs.scrollAxis as Axes,
      namedArgs.updatePublicProperties as UpdatePublicPropertiesCallback
    );
  }

  willRemove() {
    if (this.behavior !== null) {
      this.behavior.deactivate();
      this.behavior = null;
    }
  }
}

class ScrollPortBehavior {
  private screen: HTMLElement
  private contentX: Array<HTMLElement>
  private contentY: Array<HTMLElement>
  private bar: Bar | null = null
  private barX: HTMLElement
  private barY: HTMLElement
  private dimensions: Readonly<IDimensions> | null = null
  private scrollEventHandler: () => void
  private resizeEventHandler: () => void
  private startDragEventHandler: () => void
  private classNamesBuilder: ClassNamesBuilder
  private resizeObserver: ResizeObserver | null

  constructor(
    private port: HTMLElement,
    private delta: number,
    private scrollAxis: Axes,
    private updatePublicProperties: UpdatePublicPropertiesCallback
  ) {
    let
      bars: Array<Element>;

    this.classNamesBuilder = bem('scroll-port');

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

    this.resizeObserver = new ResizeObserver(() => {
      this.update();
    });

    this.resizeObserver.observe(this.port);
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

  get hasContentX() {
    return this.contentX?.length > 0 ?? 0;
  }

  get hasContentY() {
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

  @action
  public update(
    delta = this.delta,
    scrollAxis = this.scrollAxis
  ) {
    if (this.delta !== delta) this.delta = delta
    if (this.scrollAxis !== scrollAxis) this.scrollAxis = scrollAxis

    scheduleOnce('afterRender', this, () => {
      this.measure();
      this.render();
    });
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
    );

    if (this.resizeObserver) {
      this.resizeObserver.unobserve(this.port);
      this.resizeObserver = null;
    }
  }

  /**
  * Measure sizes of content and bars
  */
  private measure(): void {
    const
      dim = {} as Readonly<IDimensions>;

    setReadOnly(dim, 'portOffset', this.portOffset);

    setReadOnly(dim, 'contentSize', this.contentSizes);

    setReadOnly(dim, 'screenSize', this.screenSizes);

    setReadOnly(dim, 'isX', ({ contentSize, screenSize }) =>
      this.scrollAxis !== Axes.Y && contentSize.width > screenSize.width
    );

    setReadOnly(dim, 'isY', ({ contentSize, screenSize }) =>
      this.scrollAxis !== Axes.X && contentSize.height > screenSize.height
    );

    setReadOnly(dim, 'ratioX', ({ contentSize, screenSize }) =>
      contentSize.width > 0 && screenSize.width > 0
        ? screenSize.width / contentSize.width
        : 1
    );

    setReadOnly(dim, 'ratioY', ({ contentSize, screenSize }) =>
      contentSize.height > 0 && screenSize.height > 0
        ? screenSize.height / contentSize.height
        : 1
    );

    setReadOnly(dim, 'barSizeX', ({ screenSize, ratioX }) =>
      screenSize.width * ratioX
    );

    setReadOnly(dim, 'barSizeY', ({ screenSize, ratioY }) =>
      screenSize.height * ratioY
    );

    setReadOnly(dim, 'maxScrollX', ({ screenSize, ratioX }) =>
      Math.max(screenSize.width - screenSize.width * ratioX, 0)
    );

    setReadOnly(dim, 'maxScrollY', ({ screenSize, ratioY }) =>
      Math.max(screenSize.height - screenSize.height * ratioY, 0)
    );

    setReadOnly(dim, 'scrollX', ({ ratioX, maxScrollX }) =>
      Math.min(this.scrollX * ratioX / this.ratioX, maxScrollX)
    );

    setReadOnly(dim, 'scrollY', ({ ratioY, maxScrollY }) =>
      Math.min(this.scrollY * ratioY / this.ratioY, maxScrollY)
    );

    this.dimensions = dim;

    this.updatePublicProperties(
      dim.isX,
      dim.isY
    );
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

    this.getElementWindow(this.port).requestAnimationFrame(this.render)
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
    this.update();
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
  @action
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
        if (this.hasContentX && deltaY) {
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
      } else if (this.hasContentY && deltaY) {
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

    this.getElementWindow(this.port).requestAnimationFrame(this.render);
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

  private getElementWindow(element: HTMLElement) {
    if (
      !element ||
      !element.ownerDocument ||
      !element.ownerDocument.defaultView
    ) {
      return window;
    }
    return element.ownerDocument.defaultView;
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