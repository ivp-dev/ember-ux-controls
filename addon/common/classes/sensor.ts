import { IEventEmmiter, IEventArgs } from "ember-ux-controls/common/types"

export default abstract class Sensor {
  constructor(
    protected element: Element,
    protected eventEmmiter: IEventEmmiter
  ) { }

  abstract attach(): void

  abstract detach(): void

  public trigger(args: IEventArgs) {
    this.eventEmmiter.emitEvent(this, args)
  }
}