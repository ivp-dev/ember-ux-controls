import { IEventEmmiter, EventArgs, IEventArgs} from "ember-ux-controls/common/types"

export default abstract class Sensor {
  constructor(
    protected element: Element,
    protected eventEmmiter: IEventEmmiter
  ) { }

  abstract attach(): void

  abstract detach(): void

  public trigger(argsType: EventArgs<IEventArgs>, args: any[] ) {
    this.eventEmmiter.emitEvent(this, argsType, args)
  }
}