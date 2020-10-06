import { ItemCollectionChangedEventArgs } from "./item-collection";
import { A } from '@ember/array';
import SyncProxyArray from "./sync-proxy-array";

export class SelectedItemCollectionChangedEventArgs extends ItemCollectionChangedEventArgs { }

export default class SelectedItemCollection extends SyncProxyArray<unknown, unknown> {
  public static Create(): SelectedItemCollection {
    let
      itemsCollection: SelectedItemCollection

    itemsCollection = SelectedItemCollection.create({
      source: A([])
    });

    return itemsCollection;
  }

  protected serializeToContent(source: unknown): unknown {
    return source;
  }

  protected serializeToSource(content: unknown): unknown {
    return content;
  }

  protected notifyListeners(
    sourceToAdd: unknown[],
    sourceToRemove: unknown[],
    offset: number
  ) {
    this.eventEmmiter.emitEvent(
      this,
      SelectedItemCollectionChangedEventArgs,
      offset,
      sourceToAdd,
      sourceToRemove
    );
  }
}