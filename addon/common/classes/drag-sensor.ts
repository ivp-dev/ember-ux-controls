import { IEventEmmiter } from "../types";
import Sensor from "./sensor";

export interface IDraggingProcess {
	start: () => void
	stop: () => void
	isActive: boolean
	target: Element
	startMovingAt?: number
}

export default abstract class DragSensor extends Sensor {
	constructor(
		element: Element,
		eventEmmiter: IEventEmmiter,
		public delay: number = 0
	) {
		super(element, eventEmmiter);
		this.delay = 0;
	}
	protected static Process = class implements IDraggingProcess {
		public startMovingAt?: number
		constructor(
			public target: Element,
			public isActive: boolean = false
		) { }
		public start() {
			this.isActive = true;
			this.startMovingAt = Date.now();
		}
		public stop() {
			this.isActive = false;
			this.startMovingAt = void 0;
		}
	}
}