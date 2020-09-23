import DragSensor from "ember-ux-controls/common/classes/drag-sensor";
import { action } from '@ember/object';
import { IEventArgs } from "ember-ux-controls/common/types";
import { assign } from '@ember/polyfills';

export class DragStopSensorEventArgs implements IEventArgs {
  constructor(
    public clientX: number,
    public clientY: number,
    public target: Element | null,
    public container: Element,
    public originalEvent: MouseEvent
  ) { }
}

export default class DragMouseSensor extends DragSensor {
  attach(): void {
    this.element.addEventListener('mousedown', this.onMouseDown);
  }

  detach(): void {
    this.element.removeEventListener('mousedown', this.onMouseDown);
  }

  @action
  onMouseDown(event: MouseEvent) {
    const { 
      pageX, 
      pageY 
    } = event;

    assign(this, { pageX, pageY });

    this.element.addEventListener('mouseup', this.onMouseUp);
    this.element.addEventListener('mousemove', this.onMouseMove);
    this.element.addEventListener('dragstart', preventNativeEvent);
  }

  @action
  onMouseMove(event: MouseEvent) {

  }

  @action
  onMouseUp(event: MouseEvent) {
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
}

function preventNativeEvent(event: MouseEvent) {
  event.preventDefault();
}