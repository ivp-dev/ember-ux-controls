import closest from 'ember-ux-controls/utils/dom/closest';
import { DragMoveSensorEventArgs, DragStartSensorEventArgs, DragStopSensorEventArgs } from 'ember-ux-controls/common/classes/concrete-sensors/drag-mouse-sensor';
import DragSensor from 'ember-ux-controls/common/classes/drag-sensor';
import DraggableModifier, { IDraggableModifierArgs } from './allow-draggable';

interface ISplitViewBehaviorArgs extends IDraggableModifierArgs { }

export default class SplitView extends DraggableModifier<ISplitViewBehaviorArgs> {
  didInstall() {
    super.didInstall();
    
    this.eventEmmiter.addEventListener(
      this,
      DragStartSensorEventArgs,
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
      DragStartSensorEventArgs,
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
    if (closest(args.dragginTarget as Element, this.element)) {
      console.log(args.dragginTarget);
    }
    //preventNativeEvent(_args.originalEvent)
  }

  dragStart(_sender: DragSensor, _args: DragStartSensorEventArgs) {
    //preventNativeEvent(_args.originalEvent)
  }

  dragStop(_sender: DragSensor, _args: DragStopSensorEventArgs) {

  }
}