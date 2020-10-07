import SyncProxyArray from "./sync-proxy-array";
import { A, isArray } from '@ember/array';
import { addObserver, removeObserver } from '@ember/object/observers';
import NativeArray from "@ember/array/-private/native-array";
import ItemsControl from "ember-ux-controls/common/classes/items-control";
import { set } from '@ember/object';
import { BaseEventArgs } from "ember-ux-controls/common/classes/event-args";
import Enumerable from "@ember/array/-private/enumerable";
import { DeferredAction } from "ember-ux-controls/common/types";

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
  public host: ItemsControl | null = null;

  //constructor
  public init() {
    if (!this.host) {
      throw new Error("Host was not set");
    }

    if (this.host.itemsSource) {
      set(this, 'source', this.host.itemsSource)
    }

    addObserver(this.host, 'hasItemsSource', this, this.onSourceChanged);

    super.init();
  }

  public get isDeferred() {
    return this.deferrer.isDeferred;
  }

  private get deferrer() {
    if (!this._deferrer) {
      this._deferrer = new ItemCollection.Deferrer(this);
    }

    return this._deferrer;
  }

  public defer(
    action: DeferredAction
  ) {
    if (!this.deferrer.isDeferred) {
      this.deferrer.defer(action);
    }
  }

  public apply(action: DeferredAction) {
    if (this.deferrer.isDeferred) {
      this.deferrer.apply(action);
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
    if (this.deferrer.isDeferred) {
      this.deferrer.deferObject(obj);
    } else {
      super.pushObject(obj);
    }
  }

  public pushObjects(
    objects: Enumerable<unknown>
  ) {
    if (this.deferrer.isDeferred) {
      this.deferrer.deferObjects(objects);
    } else {
      super.pushObjects(objects);
    }

    return this;
  }

  public removeObjects(
    objects: Enumerable<unknown>
  ) {
    if (this.deferrer.isDeferred) {
      this.deferrer.deferObjects(objects);
    } else {
      super.removeObjects(objects);
    }

    return this;
  }

  private static Deferrer = class <T extends {}> implements IDeferrer<T> {
    constructor(
      private owner: ItemCollection
    ) {
      this.isDeferred = false;
      this.deferedObjects = A();
    }

    public isDeferred: boolean;
    public deferredAction?: DeferredAction

    public defer(
      action: DeferredAction
    ) {
      if (this.isDeferred) {
        throw 'Already defer';
      }

      this.deferredAction = action;
      this.isDeferred = true;
      this.deferedObjects.clear();
    }

    public apply(
      action: DeferredAction
    ) {
      if (this.deferredAction !== action) {
        throw 'Start defer action isn`t match'
      }

      if (!this.isDeferred) {
        throw 'Defer not active'
      }

      // first we should set isActive:false 
      // to allow pushing into source array
      this.isDeferred = false;

      if (this.deferredAction === DeferredAction.Push) {
        this.owner.pushObjects(this.deferedObjects);
      } else if (this.deferredAction === DeferredAction.Remove) {
        this.owner.removeObjects(this.deferedObjects)
      } else {
        throw 'Action was not set';
      }

      this.clear();
    }

    public deferObjects(obj: Enumerable<T>) {
      if (Array.isArray(obj)) {
        this.deferedObjects.pushObjects(obj);
      } else if (isArray(obj)) {
        this.deferedObjects.pushObjects(A(obj.toArray()));
      }
    }


    public deferObject(obj: T) {
      this.deferedObjects.pushObject(obj);
    }

    private clear() {
      this.deferedObjects.clear();
    }

    private deferedObjects: NativeArray<unknown>
  }

  private _deferrer?: IDeferrer<unknown>
}



interface IDeferrer<T> {
  isDeferred: boolean
  deferredAction?: DeferredAction
  defer: (action: DeferredAction) => void
  apply: (action: DeferredAction) => void
  deferObject: (obj: T) => void
  deferObjects: (objs: Enumerable<T>) => void
}