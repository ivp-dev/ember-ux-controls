import SyncProxyArray from "./sync-proxy-array";
import { A, isArray } from '@ember/array';
import { addObserver, removeObserver } from '@ember/object/observers';
import NativeArray from "@ember/array/-private/native-array";
import ItemsControl from "ember-ux-controls/common/classes/items-control";
import { set } from '@ember/object';
import { BaseEventArgs } from "ember-ux-controls/common/classes/event-args";
import { EventArgs, IEventArgs, IEventEmmiter } from "ember-ux-controls/common/types";
import EventEmmiter from "ember-ux-controls/common/classes/event-emmiter";
import Enumerable from "@ember/array/-private/enumerable";

export class ItemCollectionChangedEventArgs<T> extends BaseEventArgs {
  constructor(
    public offset: number,
    public newItems: Array<T>,
    public oldItems: Array<T>
  ) { super() }
}

export default class ItemCollection extends SyncProxyArray<unknown, unknown> {
  public host: ItemsControl | null = null;

  public get cacher() {
    if (!this._cacher) {
      this._cacher = new ItemCollection.Cacher(this);
    }

    return this._cacher;
  }

  protected get eventEmmiter() {
    if (!this._eventEmmiter) {
      this._eventEmmiter = new EventEmmiter();
    }
    return this._eventEmmiter;
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

  public pushObject(obj: unknown) {
    if (this.cacher.isActive) {
      this.cacher.pushObject(obj);
    } else {
      super.pushObject(obj);
    }
  }

  public pushObjects(objects: Enumerable<unknown>) {
    if (this.cacher.isActive) {
      this.cacher.pushObjects(objects);
    } else {
      super.pushObjects(objects);
    }

    return this;
  }

  private static Cacher = class <T extends {}> implements ICacher<T> {
    constructor(
      private owner: ItemCollection
    ) {
      this.isActive = false;
      this.cache = A();
    }

    public isActive: boolean;

    public delay() {
      if (this.isActive) return;
      this.isActive = true;
      this.cache.clear();
    }

    public apply() {
      if (!this.isActive) return;

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

  private _cacher?: ICacher<unknown>
  private _eventEmmiter?: IEventEmmiter
}

interface ICacher<T> {
  isActive: boolean
  delay: () => void
  apply: () => void
  pushObject: (obj: T) => void
  pushObjects: (objs: Enumerable<T>) => void
}