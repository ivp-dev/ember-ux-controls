import SyncProxyArray from "./sync-proxy-array";
import { A, isArray } from '@ember/array';
import { addObserver, removeObserver } from '@ember/object/observers';
import NativeArray from "@ember/array/-private/native-array";
import ItemsControl from "ember-ux-controls/common/classes/items-control";
import { set } from '@ember/object';
import { EventArgs } from "ember-ux-controls/common/classes/event-args";


export class ItemCollectionChangedEventArgs<T> extends EventArgs {
  constructor(
    public offset: number,
    public newItems: Array<T>,
    public oldItems: Array<T>
  ) { super() }
}

export default class ItemCollection extends SyncProxyArray<unknown, unknown> {
  public host: ItemsControl | null = null;

  protected changerDone(
    sourceToAdd: unknown[],
    sourceToRemove: unknown[],
    offset: number
  ) {
    let
      eventArgs: ItemCollectionChangedEventArgs<unknown>;

    if (this.host instanceof ItemsControl) {
      eventArgs = new ItemCollectionChangedEventArgs(
        offset,
        sourceToAdd,
        sourceToRemove
      );

      this.host.eventHandler.emitEvent(
        this,
        eventArgs
      );
    }
  }

  public init() {
    if (!this.host) {
      throw new Error("Host was not set");
    }

    if (this.host.itemsSource) {
      set(this, 'source', this.host.itemsSource)
    }

    super.init();

    addObserver(this.host, 'hasItemsSource', this, this.onSourceChanged);
  }

  protected serializeToSource(content: unknown) {
    return content;
  }

  protected serializeToContent(source: unknown) {
    return source;
  }

  private onSourceChanged() {
    let
      oldSource: NativeArray<unknown> | undefined,
      newSource: NativeArray<unknown> | undefined;

    if (!this.host) {
      throw new Error('Host was net set');
    }

    oldSource = this.source;
    newSource = this.host.itemsSource; //owner.itemsSource

    if (oldSource === newSource) {
      return;
    }

    if (isArray(oldSource)) {
      oldSource.removeArrayObserver(this, this.sourceArrayObserver);
    }

    // Replace can't be used until we can't create new instance of the 
    // container=component in code, because in case of replace 
    // ItemContainerGenerator will relink item and reuse old container.
    // It can lead to presence for two different types of containers in the 
    // containers collection

    // First we need to clear old generated containers
    if (this.content.length) {
      this.content.clear();
    }

    this.source = newSource;

    if (this.source) {
      this.source.addArrayObserver(this, this.sourceArrayObserver);

      // After that we can push new items and generate new containers
      this.content.pushObjects(A(this.source.map(item =>
        this.serializeToContent(item)
      )));
    }

    //this.content.replace(0, this.count, A(newSource?.map(item =>
    //  this.serializeToContent(item)
    //)));
  }

  public willDestroy() {
    removeObserver(this, 'host.hasItemsSource', this.onSourceChanged);

    if (this.changer.isActive) {
      this.changer.dispose();
    }

    super.willDestroy();
  }
}
