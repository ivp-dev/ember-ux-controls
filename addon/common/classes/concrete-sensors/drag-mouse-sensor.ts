import DragSensor, { IDraggingProcess } from "ember-ux-controls/common/classes/drag-sensor";
import { action } from '@ember/object';
import { IEventEmmiter } from "ember-ux-controls/common/types";
import { later, cancel } from '@ember/runloop';
import { BaseEventArgs } from 'ember-ux-controls/common/classes/event-args'
import preventNativeEvent from "ember-ux-controls/utils/prevent-native-event";
import closest from "dummy/utils/dom/closest";
import { EmberRunTimer } from "@ember/runloop/types";

export class BaseDragSensorEventArgs extends BaseEventArgs {
  constructor(
    public readonly clientX: number,
    public readonly clientY: number,
    public readonly offsetX: number,
    public readonly offsetY: number,
    public readonly dragginTarget: EventTarget | null,
    public readonly element: Element,
    private readonly originalEvent: Event,
  ) {
    super();
  }

  public preventDefault() {
    this.originalEvent.preventDefault();
  }
}

export class DragStartSensorEventArgs extends BaseDragSensorEventArgs { }

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
    let
      currentElement: Element

    currentElement = closest(
      event.target as Element,
      this.element
    ) as Element;

    if (!currentElement) {
      return;
    }

    this.dragginProcess = new DragMouseSensor.Process(currentElement);

    document.addEventListener('mouseup', this.onMouseUp);
    document.addEventListener('mousemove', this.onMouseMoveStart);
    document.addEventListener('dragstart', preventNativeEvent);

    this.mouseDownTimeout = later(() =>
      this.onMouseMoveStart(event), this.delay
    );
  }

  @action
  private onMouseMoveStart(event: MouseEvent) {
    document.removeEventListener(
      'mousemove',
      this.onMouseMoveStart
    );

    if (this.mouseDownTimeout) {
      cancel(this.mouseDownTimeout);
    }

    if (
      this.dragginProcess &&
      !this.dragginProcess.isActive
    ) {
      this.dragginProcess.start();
      this.startDrag(event);
    }

  }

  private startDrag(event: MouseEvent) {
    let
      dragEvent: DragStartSensorEventArgs,
      dragginTarget: Element;

    if (
      !this.dragginProcess ||
      !this.dragginProcess.isActive
    ) {
      return;//TODO: or throw an error
    }

    dragginTarget = this.dragginProcess.target;

    dragEvent = this.eventEmmiter.emitEvent(
      this,
      DragStartSensorEventArgs,
      event.clientX,
      event.clientY,
      event.offsetX,
      event.offsetY,
      dragginTarget,
      this.element,
      event
    );

    if (dragEvent.canceled) {
      this.dragginProcess.stop();
    }

    if (this.dragginProcess.isActive) {
      document.addEventListener('mousemove', this.onMouseMove);
    }
  }

  @action
  private onMouseMove(event: MouseEvent) {
    let
      dragginTarget: Element;

    if (
      !this.dragginProcess ||
      !this.dragginProcess.isActive
    ) {
      return;//TODO: or throw an error
    }

    dragginTarget = this.dragginProcess.target;

    this.eventEmmiter.emitEvent(
      this,
      DragMoveSensorEventArgs,
      event.clientX,
      event.clientY,
      event.offsetX,
      event.offsetY,
      dragginTarget,
      this.element,
      event
    );
  }

  @action
  private onMouseUp(event: MouseEvent) {
    let
      dragginTarget: Element,
      dragEvent: DragStartSensorEventArgs;

    if (
      !this.dragginProcess ||
      !this.dragginProcess.isActive
    ) {
      return;//TODO: or throw an error
    }

    dragginTarget = this.dragginProcess.target;

    document.removeEventListener('mouseup', this.onMouseUp);
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('dragstart', preventNativeEvent);

    //target = document.elementFromPoint(event.clientX, event.clientY);

    dragEvent = this.eventEmmiter.emitEvent(
      this,
      DragStopSensorEventArgs,
      event.clientX,
      event.clientY,
      event.offsetX,
      event.offsetY,
      dragginTarget,
      this.element,
      event
    );
  }

  private dragginProcess?: IDraggingProcess
  private mouseDownTimeout?: EmberRunTimer
}