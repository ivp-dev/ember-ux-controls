import { ItemCollectionChangedEventArgs } from "./item-collection";
import SyncProxyArray from "./sync-proxy-array";

export class SelectedItemCollectionChangedEventArgs<T> extends ItemCollectionChangedEventArgs<T> {}

export default class SelectedItemCollection extends SyncProxyArray<unknown, unknown> {
  protected serializeToSource(content: unknown) {
    return content;
  }

  protected serializeToContent(source: unknown) {
    return source;
  }
}