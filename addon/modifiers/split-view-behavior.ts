import closest from 'ember-ux-controls/utils/dom/closest';
import { DragMoveSensorEventArgs, DragStartSensorEvent, DragStopSensorEventArgs } from 'ember-ux-controls/common/classes/concrete-sensors/drag-mouse-sensor';
import DragSensor from 'ember-ux-controls/common/classes/drag-sensor';
import DraggableModifier, { IDraggableModifierArgs } from './allow-draggable';

interface ISplitViewBehaviorArgs extends IDraggableModifierArgs { }

export default class SplitView extends DraggableModifier<ISplitViewBehaviorArgs> {
  didInstall() {
    super.didInstall();
    
    this.eventEmmiter.addEventListener(
      this,
      DragStartSensorEvent,
      this.dragStart
    );

    this.eventEmmiter.addEventListener(
      this,
      DragMoveSensorEventArgs,
      this.dragMove
    );

    this.eventEmmiter.addEventListener(
      this,
      DragStopSensorEventArgs,
      this.dragStop
    );
  }

  willDestroy() {
    super.willDestroy();

    this.eventEmmiter.removeEventListener(
      this,
      DragStartSensorEvent,
      this.dragStart
    );

    this.eventEmmiter.removeEventListener(
      this,
      DragMoveSensorEventArgs,
      this.dragMove
    );

    this.eventEmmiter.removeEventListener(
      this,
      DragStopSensorEventArgs,
      this.dragStop
    );
  }

  dragMove(_sender: DragSensor, args: DragMoveSensorEventArgs) {
    if (closest(args.target as Element, this.element)) {
      console.log(args.target);
    }
    //preventNativeEvent(_args.originalEvent)
  }

  dragStart(_sender: DragSensor, _args: DragStartSensorEvent) {
    //preventNativeEvent(_args.originalEvent)
  }

  dragStop(_sender: DragSensor, _args: DragStopSensorEventArgs) {

  }
}