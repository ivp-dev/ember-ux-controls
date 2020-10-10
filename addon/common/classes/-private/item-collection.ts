import SyncProxyArray from "./sync-proxy-array";
import ItemsControl from "ember-ux-controls/common/classes/items-control";
import { BaseEventArgs } from "ember-ux-controls/common/classes/event-args";

export class ItemCollectionPushCompleteArgs extends BaseEventArgs { }

export class ItemCollectionChangedEventArgs extends BaseEventArgs {
  constructor(
    public offset: number,
    public newItems: Array<unknown>,
    public oldItems: Array<unknown>
  ) { super() }
}

export class ItemCollectionSourceChangedEventArgs extends BaseEventArgs {
  constructor(
    public newSource: Array<unknown> | undefined,
    public oldSource: Array<unknown> | undefined
  ) { super() }
}

export default class ItemCollection extends SyncProxyArray<unknown, unknown> {
  public host?: ItemsControl;

  public static Create(
    host: ItemsControl
  ) {
    let
      itemsCollection: ItemCollection

    itemsCollection = ItemCollection.create({
      'source': host.itemsSource
    });

    return itemsCollection;
  }

  protected notifyListeners(
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

  protected serializeToSource(content: unknown) {
    return content;
  }

  protected serializeToContent(source: unknown) {
    return source;
  }
}
