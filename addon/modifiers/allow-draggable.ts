import Modifier from 'ember-modifier';
import { inject } from '@ember/service';
import { IEventEmmiter } from 'ember-ux-controls/common/types'
import Sensor from 'ember-ux-controls/common/classes/sensor';
import MouseSensor from 'ember-ux-controls/common/classes/concrete-sensors/drag-mouse-sensor';

interface IDraggableModifierArgs {
  named: {
    allowMouseSensor?: boolean,
    allowTouchSensor?: boolean,
    delay?: number
  }
  positional: []
}

export default class DraggableModifier extends Modifier<IDraggableModifierArgs> {
  private get sensors() {
    if (!this._sensors) {
      this._sensors = [];
    }

    return this._sensors;
  }

  private get eventEmmiter() {
    if (!this._eventEmmiter) {
      throw 'EventEmmiter was not set'
    }

    return this._eventEmmiter;
  }

  public didInstall() {
    let
      allowMouseSensor: boolean,
      allowTouchSensor: boolean;

    allowMouseSensor = this.args.named.allowMouseSensor ?? true
    allowTouchSensor = this.args.named.allowTouchSensor ?? true

    if (allowMouseSensor) {
      this.sensors.push(
        new MouseSensor(
          this.element,
          this.eventEmmiter,
          this.args.named.delay
        )
      )
    }

    if (allowTouchSensor) {
      //TODO: add touch sensor
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
  private _sensors?: Sensor[]
}