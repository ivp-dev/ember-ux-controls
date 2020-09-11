import SyncProxyArray from "./sync-proxy-array";

export default class SelectedItemCollection extends SyncProxyArray<unknown, unknown> {
  protected serializeToSource(content: unknown) {
    return content;
  }

  protected serializeToContent(source: unknown) {
    return source;
  }
}