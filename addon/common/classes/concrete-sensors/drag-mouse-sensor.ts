import DragSensor from "ember-ux-controls/common/classes/drag-sensor";
import { action } from '@ember/object';
import { IEventEmmiter } from "ember-ux-controls/common/types";
import { later, cancel } from '@ember/runloop';
import { EmberRunTimer } from "@ember/runloop/types";
import { CancellableEventArgs } from "ember-ux-controls/common/classes/event-args";

export class DragStartSensorEvent extends CancellableEventArgs {
  constructor(
    public clientX: number,
    public clientY: number,
    public target: EventTarget | null,
    public element: Element,
    public originalEvent: MouseEvent,
  ) { super() }
}

export class DragStopSensorEventArgs extends CancellableEventArgs {
  constructor(
    public clientX: number,
    public clientY: number,
    public target: EventTarget | null,
    public container: Element,
    public originalEvent: MouseEvent
  ) { super() }
}

export default class DragMouseSensor extends DragSensor {
  constructor(
    element: Element,
    eventEmmiter: IEventEmmiter,
    delay?: number
  ) {
    super(element, eventEmmiter);

    if (
      typeof delay !== 'undefined' &&
      this.delay !== delay
    ) {
      this.delay = delay;
    }
  }
  public attach(): void {
    this.element.addEventListener('mousedown', this.onMouseDown);
  }

  public detach(): void {
    this.element.removeEventListener('mousedown', this.onMouseDown);
  }

  @action
  private onMouseDown(event: MouseEvent) {
    this.element.addEventListener('mouseup', this.onMouseUp);
    this.element.addEventListener('mousemove', this.onMouseMoveStart);
    this.element.addEventListener('dragstart', preventNativeEvent);
    later(() => this.onMouseMoveStart(event), this.delay);
    this.startMovingAt = Date.now();
  }

  @action
  private onMouseMoveStart(event: MouseEvent) {
    this.element.removeEventListener('mousemove', this.onMouseMoveStart);
    if (this.mouseDownTimeout) cancel(this.mouseDownTimeout);
    this.startDrag(event);
  }


  private startDrag(event: MouseEvent) {
    let
      dragStartEvent: DragStartSensorEvent;

    dragStartEvent = new DragStartSensorEvent(
      event.clientX,
      event.clientY,
      event.target,
      this.element,
      event
    );

    this.eventEmmiter.emitEvent(this, dragStartEvent)

    this.dragging = !dragStartEvent.canceled;

    if (this.dragging) {
      this.element.addEventListener('mousemove', this.onMouseMove)
    }
  }

  @action
  private onMouseMove(event: MouseEvent) {

  }

  @action
  private onMouseUp(event: MouseEvent) {
    let
      args: DragStopSensorEventArgs,
      target: Element | null;

    this.element.removeEventListener('mouseup', this.onMouseUp);
    this.element.removeEventListener('mousemove', this.onMouseMove);
    this.element.removeEventListener('dragstart', preventNativeEvent);

    target = document.elementFromPoint(event.clientX, event.clientY);

    args = new DragStopSensorEventArgs(
      event.clientX,
      event.clientY,
      target,
      this.element,
      event
    );

    this.trigger(args);
  }

  private startMovingAt?: number
  private mouseDownTimeout?: EmberRunTimer
}

function preventNativeEvent(event: MouseEvent) {
  event.preventDefault();
}