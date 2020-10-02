import { EventArgs, IEventArgs, IEventEmmiter } from "ember-ux-controls/common/types";
import EventEmmiter from "../event-emmiter";
import { ItemCollectionChangedEventArgs } from "./item-collection";
import { A } from '@ember/array';
import SyncProxyArray from "./sync-proxy-array";
export class SelectedItemCollectionChangedEventArgs<T> extends ItemCollectionChangedEventArgs<T> { }

export default class SelectedItemCollection extends SyncProxyArray<unknown, unknown> {
  public static Create(): SelectedItemCollection {
    let
      itemsCollection: SelectedItemCollection

    itemsCollection = SelectedItemCollection.create({
      source: A()
    });

    return itemsCollection;
  }

  protected serializeToContent(source: unknown): unknown {
    return source;
  }

  protected serializeToSource(content: unknown): unknown {
    return content;
  }

  protected get eventEmmiter() {
    if (!this._eventEmmiter) {
      this._eventEmmiter = new EventEmmiter();
    }
    return this._eventEmmiter;
  }

  public addEventListener(
    context: object,
    key: EventArgs<IEventArgs>,
    callback: (sender: object, args: IEventArgs
    ) => void) {
    this.eventEmmiter.addEventListener(context, key, callback)
  }

  public removeEventListener(
    context: object,
    key: EventArgs<IEventArgs>,
    callback: (sender: object, args: IEventArgs
    ) => void) {
    this.eventEmmiter.removeEventListener(context, key, callback)
  }

  protected changerDone(
    sourceToAdd: unknown[],
    sourceToRemove: unknown[],
    offset: number
  ) {
    this.eventEmmiter.emitEvent(
      this,
      ItemCollectionChangedEventArgs,
      offset,
      sourceToAdd,
      sourceToRemove
    );
  }

  private _eventEmmiter?: IEventEmmiter
}