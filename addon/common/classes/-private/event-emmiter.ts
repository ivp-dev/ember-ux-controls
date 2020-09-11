import { IEquatable } from '../../types';

export interface IEventArgs { }

export interface IEventEmmiter {
  emitEvent(
    sender: object,
    args: IEventArgs
  ): void

  addEventListener<T extends IEventArgs>(
    context: object,
    key: IEventArgs,
    callback: (sender: object, args: T) => void
  ): void

  removeEventListener(
    context: object,
    key: IEventArgs
  ): void

  clearEventListeners(): void

  hasListeners: boolean
}


class Listener implements IEquatable {
  constructor(
    public context: object,
    public callback: (sender: object, args: IEventArgs) => void,
  ) { }
  equals(obj: any) {
    if (obj instanceof Listener) {
      return obj.context === this.context;
    }
    return this.context === obj;
  }
}


export default class EventEmmiter implements IEventEmmiter{
  private _events: Map<IEventArgs, Array<Listener>>;

  constructor() {
    this._events = new Map();
  }

  emitEvent(
    sender: object,
    args: IEventArgs
  ): void {
    const
      ls = this._events.get(args.constructor as IEventArgs);

    if (ls && ls.length) {
      ls.forEach(l => l.callback.call(l.context, sender, args));
    }
  }

  addEventListener<T extends IEventArgs>(
    context: object,
    key: IEventArgs,
    callback: (sender: object, args: T) => void
  ): void {
    if (!this._events.has(key)) {
      this._events.set(key, []);
    }

    this._events.get(key)?.push(
      new Listener(context, callback)
    );
  }

  removeEventListener(
    context: object,
    key: IEventArgs
  ): void {
    const
      ls = this._events.get(key),
      l = ls?.find(l => l.context === context);

    if (ls && l) {
      ls.splice(ls.indexOf(l), 1)
    };
  }

  clearEventListeners() {
    this._events.clear();
  }

  get hasListeners() {
    return this._events.size > 0
  }
}