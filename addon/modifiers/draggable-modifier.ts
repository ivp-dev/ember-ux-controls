// @ts-ignore
import { setModifierManager, capabilities } from '@ember/modifier';
import Modifier from 'ember-modifier';
import { inject } from '@ember/service';
import { IEventEmmiter } from 'ember-ux-controls/common/types'
import Sensor from 'ember-ux-controls/common/classes/sensor';
import MouseSensor from 'ember-ux-controls/common/classes/concrete-sensors/drag-mouse-sensor';

interface IDraggableModifierArgs {
  named: {
    allowMouseSensor: boolean,
    allowTouchSensor: boolean
  }
  positional: []
}

export default class DraggableModifier extends Modifier<IDraggableModifierArgs> {
  @inject
  private eventEmmiter!: IEventEmmiter
  private sensors: Sensor[] = []

  public didInstall() {
    let
      allowMouseSensor: boolean,
      allowTouchSensor: boolean;

    allowMouseSensor = this.args.named.allowMouseSensor ?? true
    allowTouchSensor = this.args.named.allowTouchSensor ?? true

    if (allowMouseSensor) {
      this.sensors.push(new MouseSensor(this.element, this.eventEmmiter))
    }

    if(allowTouchSensor) {
      //TODO: add touch sensor
    }

    //TODO: add another sensors

    this.sensors.forEach(sensor => sensor.attach());
  }

  public willRemove() {
    this.sensors.forEach(sensor => sensor.detach());
    this.sensors.length = 0;
  }
}