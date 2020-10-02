import Service from '@ember/service';
import { IEventArgs, EventArgs, IEventEmmiter } from 'ember-ux-controls/common/types';
import Emmiter from 'ember-ux-controls/common/classes/event-emmiter';

export default class EventEmmiter extends Service implements IEventEmmiter {

  public addEventListener<T extends IEventArgs>(
    context: object,
    key: EventArgs<T>,
    callback: (sender: object, args: IEventArgs) => void
  ): void {
    this.emmiter.addEventListener<T>(context, key, callback);
  }

  public removeEventListener<T extends IEventArgs>(
    context: object,
    key: EventArgs<T>,
    callback: (sender: object, args: IEventArgs) => void
  ): void {
    this.emmiter.removeEventListener<T>(context, key, callback);
  }

  public emitEvent<T extends IEventArgs>(
    sender: object,
    eventType: EventArgs<T>,
    ...eventArgs: any[]
  ): T {
    return this.emmiter.emitEvent<T>(sender, eventType, ...eventArgs);
  }

  public clearEventListeners() {
    this.emmiter.clearEventListeners();
  }

  public get hasListeners() {
    return this.emmiter.hasListeners;
  }

  private get emmiter(): IEventEmmiter {
    if (!this._emmiter) {
      this._emmiter = new Emmiter()
    }

    return this._emmiter;
  }

  private _emmiter?: IEventEmmiter
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    'event-emmiter': EventEmmiter;
  }
}

