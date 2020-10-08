import Modifier, { ModifierArgs as IModifierArgs } from 'ember-modifier';
import { getOwner } from '@ember/application';
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
      this._eventEmmiter = (
        getOwner(this).lookup('service:event-emmiter')
      ) as IEventEmmiter
    }

    return this._eventEmmiter;
  }

  index = 0

  public didInstall() {
    let
      delay: number,
      mouseSensor: MouseSensor;

    delay = this.args.named.delay as number ?? 0;

    if (this.args.named['allowMouseSensor'] ?? true) {
      mouseSensor = new MouseSensor(
        this.element,
        this.eventEmmiter,
        delay
      );

      this.sensors.push(
        mouseSensor
      );
    }

    if (this.args.named['allowTouchSensor'] ?? true) {
      //TODO: add touch sensor and another
    }

    //TODO: add another sensors
    this.sensors.forEach(sensor => sensor.attach());
  }

  public willRemove() {
    this.sensors.forEach(sensor => sensor.detach());
    this.sensors.length = 0;
  }

  private _eventEmmiter?: IEventEmmiter
  private _sensors?: Array<Sensor>
}