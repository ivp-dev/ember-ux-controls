import DragSensor from "ember-ux-controls/common/classes/drag-sensor";
import { action } from '@ember/object';
import { IEventEmmiter } from "ember-ux-controls/common/types";
import { later, cancel } from '@ember/runloop';
import { EmberRunTimer } from "@ember/runloop/types";
import { BaseEventArgs } from 'ember-ux-controls/common/classes/event-args'
import preventNativeEvent from "ember-ux-controls/utils/prevent-native-event";

export class BaseDragSensorEventArgs extends BaseEventArgs {
  public clientX: number
  public clientY: number
  public target: EventTarget | null
  public element: Element
  public originalEvent: MouseEvent
  constructor(
    ...args: any[]
  ) {
    super();

    [
      this.clientX,
      this.clientY,
      this.target,
      this.element,
      this.originalEvent
    ] = args;
  }
}

export class DragStartSensorEvent extends BaseDragSensorEventArgs {

}

export class DragStopSensorEventArgs extends BaseDragSensorEventArgs { }

export class DragMoveSensorEventArgs extends BaseDragSensorEventArgs { }

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
    document.addEventListener('mousedown', this.onMouseDown);
  }

  public detach(): void {
    document.removeEventListener('mousedown', this.onMouseDown);
  }

  @action
  private onMouseDown(event: MouseEvent) {
    document.addEventListener('mouseup', this.onMouseUp);
    document.addEventListener('mousemove', this.onMouseMoveStart);
    document.addEventListener('dragstart', preventNativeEvent);
    this.mouseDownTimeout = later(() => this.onMouseMoveStart(event), this.delay);
    this.startMovingAt = Date.now();
  }

  @action
  private onMouseMoveStart(event: MouseEvent) {
    document.removeEventListener('mousemove', this.onMouseMoveStart);
    if (this.mouseDownTimeout) cancel(this.mouseDownTimeout);
    this.startDrag(event);
  }

  private startDrag(event: MouseEvent) {
    let
      dragStartEvent: DragStartSensorEvent;

    dragStartEvent = this.eventEmmiter.emitEvent(
      this,
      DragStartSensorEvent, [
      event.clientX,
      event.clientY,
      event.target,
      this.element,
      event
    ]);

    this.dragging = !dragStartEvent.canceled;

    if (this.dragging) {
      document.addEventListener('mousemove', this.onMouseMove)
    }
  }

  @action
  private onMouseMove(event: MouseEvent) {
    this.eventEmmiter.emitEvent(
      this,
      DragMoveSensorEventArgs, [
      event.clientX,
      event.clientY,
      event.target,
      this.element,
      event
    ]);
  }

  @action
  private onMouseUp(event: MouseEvent) {
    let
      args: DragStopSensorEventArgs,
      target: Element | null;

    document.removeEventListener('mouseup', this.onMouseUp);
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('dragstart', preventNativeEvent);

    target = document.elementFromPoint(event.clientX, event.clientY);

    args = new DragStopSensorEventArgs(
      event.clientX,
      event.clientY,
      target,
      this.element,
      event
    );

    this.eventEmmiter.emitEvent(
      this,
      DragStopSensorEventArgs, [
      event.clientX,
      event.clientY,
      target,
      this.element,
      event
    ]);
  }

  private startMovingAt?: number
  private mouseDownTimeout?: EmberRunTimer
}