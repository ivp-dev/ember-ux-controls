import Service from '@ember/service';
import { IEquatable, IEventArgs, IEventEmmiter } from 'ember-ux-controls/common/types';

type Callback = (sender: object, args: IEventArgs) => void

class Listener implements IEquatable {
  private readonly callbacks: Callback[]

  constructor(
    public context: object,
    callback: Callback[] | Callback
  ) {
    if (Array.isArray(callback)) {
      this.callbacks = callback;
    } else {
      this.callbacks = [callback];
    }
  }

  addCallback(callback: Callback) {
    if (this.callbacks.indexOf(callback) > -1) {
      this.callbacks.push(callback)
    }
  }

  apply(action: (value: Callback, index: number, array: Callback[]) => void) {
    this.callbacks.forEach(action);
  }

  removeCallback(callback: Callback) {
    let
      index: number;

    index = this.callbacks.indexOf(callback);

    if (index > -1) {
      this.callbacks.splice(index, 1);
    }
  }

  clear() {
    this.callbacks.length = 0;
  }

  equals(obj: any) {
    if (obj instanceof Listener) {
      return obj.context === this.context;
    }
    return this.context === obj;
  }
}

export default class EventEmmiter extends Service.extend({
  // anything which *must* be merged to prototype here
}) implements IEventEmmiter {
  constructor() {
    super(...arguments);

    this.events = new Map<IEventArgs, Listener[]>();
  }

  public emitEvent(
    sender: object,
    args: IEventArgs
  ): void {
    const
      listeners: Listener[] | undefined = this.events.get(args.constructor as IEventArgs);

    if (listeners && listeners.length) {
      listeners.forEach(l => l.apply(callback => callback.call(l.context, sender, args)));
    }
  }

  public addEventListener<T extends IEventArgs>(
    context: object,
    key: IEventArgs,
    callback: (sender: object, args: T) => void
  ): void {
    let
      listener: Listener | undefined,
      listeners: Listener[] | undefined;

    listeners = this.events.get(key);
    if (!listeners) {
      listener = new Listener(context, callback);
      this.events.set(key, [listener]);
    } else if ((listener = listeners.find(l => l.equals(context)))) {
      listener.addCallback(callback);
    }
  }

  public removeEventListener<T extends IEventArgs>(
    context: object,
    key: IEventArgs,
    callback?: (sender: object, args: T) => void
  ): void {
    let
      listener: Listener | undefined,
      listeners: Listener[] | undefined;

    listeners = this.events.get(key);

    if (listeners && (listener = listeners.find(l => l.equals(context)))) {
      if (callback) {
        listener.removeCallback(callback);
      } else {
        listener.clear();
      }
    };
  }

  public clearEventListeners() {
    this.events.clear();
  }

  public get hasListeners() {
    return this.events.size > 0
  }

  private events: Map<IEventArgs, Listener[]>;
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    'event-emmiter': EventEmmiter;
  }
}
