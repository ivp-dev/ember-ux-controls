import Modifier, { ModifierArgs as IModifierArgs } from 'ember-modifier';
import { inject } from '@ember/service';
import { IEventEmmiter } from 'ember-ux-controls/common/types'
import Sensor from 'ember-ux-controls/common/classes/sensor';
import MouseSensor from 'ember-ux-controls/common/classes/concrete-sensors/drag-mouse-sensor';

export interface IDraggableModifierArgs extends IModifierArgs {
}

export default class DraggableModifier<T extends IDraggableModifierArgs> extends Modifier<T> {
  protected get sensors() {
    if (!this._sensors) {
      this._sensors = [];
    }

    return this._sensors;
  }

  protected get eventEmmiter() {
    if (!this._eventEmmiter) {
      throw 'EventEmmiter was not set'
    }

    return this._eventEmmiter;
  }

  public didInstall() {
    let
      delay: number,
      allowMouseSensor: boolean,
      allowTouchSensor: boolean,
      mouseSensor: MouseSensor;

    delay = this.args.named.delay as number ?? 0;
    allowMouseSensor = this.args.named['allowMouseSensor'] as boolean ?? true;
    allowTouchSensor = this.args.named['allowTouchSensor'] as boolean ?? true

    if (allowMouseSensor) {
      mouseSensor = new MouseSensor(
        this.element,
        this.eventEmmiter,
        delay
      );

      this.sensors.push(
        mouseSensor
      );
    }

    if (allowTouchSensor) {
      //TODO: add touch sensor and another
    }

    //TODO: add another sensors

    this.sensors.forEach(sensor => sensor.attach());
  }

  public willRemove() {
    this.sensors.forEach(sensor => sensor.detach());
    this.sensors.length = 0;
  }

  @inject('event-emmiter')
  private _eventEmmiter?: IEventEmmiter
  
  private _sensors?: Array<Sensor>
}