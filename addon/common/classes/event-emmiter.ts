import { IEquatable, IEventArgs, EventArgs, IEventEmmiter } from 'ember-ux-controls/common/types';

interface IListener extends IEquatable {
  context: object,
  callback: (sender: object, args: IEventArgs) => void
}

class Listener implements IListener {
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

export default class EventEmmiter implements IEventEmmiter {
  constructor() {
    this.events = new Map<EventArgs<IEventArgs>, Array<IListener>>();
  }

  public emitEvent<T extends IEventArgs>(
    sender: object,
    eventType: EventArgs<T>,
    ...eventArgs: any[]
  ): T {
    let
      listener: IListener,
      idx: number,
      count: number,
      listeners: Array<IListener> | undefined,
      args: T;

    args = new eventType(...eventArgs);
    listeners = this.events.get(eventType);
    if (listeners && listeners.length) {
      idx = 0;
      count = listeners.length;
      while (idx < count) {
        listener = listeners[idx++];
        listener.callback.call(listener.context, sender, args);
        if (args.stopped) break;
      }
    }

    return args;
  }

  public addEventListener<T extends IEventArgs>(
    context: object,
    key: EventArgs<T>,
    callback: (sender: object, args: IEventArgs) => void
  ): void {
    let
      listeners: Array<IListener> | undefined;

    listeners = this.events.get(key);
    if (!listeners) {
      listeners = [];
      this.events.set(key, listeners);
    }

    listeners.push(
      new Listener(context, callback)
    );
  }

  public removeEventListener<T extends IEventArgs>(
    context: object,
    key: EventArgs<T>,
    callback: (sender: object, args: IEventArgs) => void
  ): void {
    let
      index: number,
      listeners: Array<IListener> | undefined;

    listeners = this.events.get(key);

    if (
      listeners && (
        index = indexOfEquatable(
          listeners, new Listener(context, callback))
      ) > -1
    ) {
      listeners.splice(index, 1);
    }
  }

  public clearEventListeners() {
    this.events.clear();
  }

  public get hasListeners() {
    return this.events.size > 0
  }

  private events: Map<EventArgs<IEventArgs>, Array<IListener>>;
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

