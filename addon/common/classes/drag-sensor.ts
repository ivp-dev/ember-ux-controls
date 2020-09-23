import Sensor from "./sensor";

export default abstract class DragSensor extends Sensor {
    public pageX: number = 0
    public pageY: number = 0
    public dragging: boolean = false
}