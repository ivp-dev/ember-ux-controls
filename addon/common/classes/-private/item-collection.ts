import SyncProxyArray from "./sync-proxy-array";
import { A, isArray } from '@ember/array';
import { addObserver, removeObserver } from '@ember/object/observers';
import NativeArray from "@ember/array/-private/native-array";
import ItemsControl from "ember-ux-controls/common/classes/items-control";
import { set } from '@ember/object';
import { BaseEventArgs } from "ember-ux-controls/common/classes/event-args";
import Enumerable from "@ember/array/-private/enumerable";

export class ItemCollectionPushCompleteArgs extends BaseEventArgs {

}

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
  public host: ItemsControl | null = null;

  //constructor
  public init() {
    if (!this.host) {
      throw new Error("Host was not set");
    }

    if (this.host.itemsSource) {
      set(this, 'source', this.host.itemsSource)
    }

    addObserver(
      this.host,
      'hasItemsSource',
      this,
      this.onSourceChanged
    );

    super.init();
  }

  public get isPushingActive() {
    return this.pusher.isActive;
  }

  private get pusher() {
    if (!this._pusher) {
      this._pusher = new ItemCollection.Pusher(this);
    }

    return this._pusher;
  }

  public deferPush() {
    if (!this.pusher.isActive) {
      this.pusher.deferPush();
    }
  }

  public applyPush() {
    if (this.pusher.isActive) {
      this.pusher.applyPush();
    }
  }

  public static Create(
    host: ItemsControl
  ) {
    let
      itemsCollection: ItemCollection

    itemsCollection = ItemCollection.create({
      host
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

    this.eventEmmiter.emitEvent(
      this,
      ItemCollectionSourceChangedEventArgs,
      newSource,
      oldSource
    );

    //this.content.replace(0, this.count, A(newSource?.map(item =>
    //  this.serializeToContent(item)
    //)));
  }

  public willDestroy() {
    removeObserver(
      this,
      'host.hasItemsSource',
      this.onSourceChanged
    );

    super.willDestroy();
  }

  public pushObject(obj: unknown) {
    if (this.pusher.isActive) {
      this.pusher.pushObject(obj);
    } else {
      super.pushObject(obj);
    }
  }

  public pushObjects(
    objects: Enumerable<unknown>
  ) {
    if (this.pusher.isActive) {
      this.pusher.pushObjects(objects);
    } else {
      super.pushObjects(objects);
    }

    return this;
  }

  private static Pusher = class <T extends {}> implements IPusher<T> {
    constructor(
      private owner: ItemCollection
    ) {
      this.isActive = false;
      this.cache = A();
    }

    public isActive: boolean;

    public deferPush() {
      if (this.isActive) {
        return;
      }

      this.isActive = true;
      this.cache.clear();
    }

    public applyPush() {
      if (!this.isActive) {
        return;
      }

      // first we should set isActive:false 
      // to allow pushing into source array
      this.isActive = false;

      this.owner.pushObjects(this.cache);

      this.clear();
    }

    public pushObjects(obj: Enumerable<T>) {
      if (Array.isArray(obj)) {
        this.cache.pushObjects(obj);
      } else if (isArray(obj)) {
        this.cache.pushObjects(A(obj.toArray()));
      }
    }

    public pushObject(obj: T) {
      this.cache.pushObject(obj);
    }

    private clear() {
      this.cache.clear();
    }

    private cache: NativeArray<unknown>
  }

  private _pusher?: IPusher<unknown>
}

interface IPusher<T> {
  isActive: boolean
  deferPush: () => void
  applyPush: () => void
  pushObject: (obj: T) => void
  pushObjects: (objs: Enumerable<T>) => void
}