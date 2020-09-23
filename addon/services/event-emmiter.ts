import Service from '@ember/service';
import { IEquatable, IEventArgs, IEventEmmiter } from 'ember-ux-controls/common/types';

class Listener implements IEquatable {
  constructor(
    public context: object,
    public callback: (sender: object, args: IEventArgs) => void,
  ) { }

  equals(obj: any) {
    if (obj instanceof Listener) {
      return (
        obj.context === this.context &&
        obj.callback === this.callback
      );
    }
    return this.context === obj;
  }
}

export default class EventEmmiter extends Service.extend({
  // anything which *must* be merged to prototype here
}) implements IEventEmmiter {
  constructor() {
    super(...arguments);

    this.events = new Map<IEventArgs, Array<Listener>>();
  }

  emitEvent(
    sender: object,
    args: IEventArgs
  ): void {
    const
      ls = this.events.get(args.constructor as IEventArgs);

    if (ls && ls.length) {
      ls.forEach(l => l.callback.call(l.context, sender, args));
    }
  }

  addEventListener<T extends IEventArgs>(
    context: object,
    key: IEventArgs,
    callback: (sender: object, args: T) => void
  ): void {
    let
      listeners: Array<Listener> | undefined;

    listeners = this.events.get(key);
    if (!listeners) {
      listeners = [];
      this.events.set(key, listeners);
    }

    listeners.push(
      new Listener(context, callback)
    );
  }

  removeEventListener<T extends IEventArgs>(
    context: object,
    key: IEventArgs,
    callback: (sender: object, args: T) => void
  ): void {
    let
      index: number,
      listeners: Array<Listener> | undefined;

    listeners = this.events.get(key);

    if (
      listeners &&
      (index = indexOfEquatable(listeners, new Listener(context, callback))) > -1
    )
      listeners.splice(index, 1)
  }


  public clearEventListeners() {
    this.events.clear();
  }

  public get hasListeners() {
    return this.events.size > 0
  }

  private events: Map<IEventArgs, Array<Listener>>;
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    'event-emmiter': EventEmmiter;
  }
}

function indexOfEquatable(source: Array<IEquatable>, obj: IEquatable) {
  let
    count: number,
    index: number;

  for (
    index = 0,
    count = source.length;
    index < count;
    index++
  ) {
    if (source[index].equals(obj)) {
      return index;
    }
  }

  return -1;
}
