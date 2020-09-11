import ItemContainerGenerator from "./item-container-generator";
import { IEquatable } from '../../types';
import ItemsControl from "ember-ux-controls/common/classes/items-control";

const RESOLVED = Symbol('resolved');
const UNRESOLVED = Symbol('unresolved');
const REMOVED = Symbol('removed');
const SENTINEL = Symbol('sentinel');
const KEY = Symbol('key');

export const CONTAINERS = {
  RESOLVED,
  UNRESOLVED,
  REMOVED,
  SENTINEL,
  KEY,
};

export default class ItemInfo implements IEquatable {
  constructor(
    index: number,
    item: unknown,
    container: unknown
  ) {
    this._index = index;
    this._item = item;
    this._container = container;
  }

  get item() {
    return this._item;
  }

  get index() {
    return this._index;
  }

  set index(value: number) {
    this._index = value;
  }

  get container() {
    return this._container;
  }

  set container(value: unknown) {
    this._container = value;
  }

  get isRemoved() {
    return this.container === REMOVED;
  }

  get isKey() {
    return this.container === KEY;
  }

  get isResolved() {
    return this.container !== UNRESOLVED
  }

  equals(obj: any, matchUnresolved: boolean = false) {
    return (
      obj instanceof ItemInfo &&
      this.equalsInfo(obj, matchUnresolved)
    );
  }

  public refresh(generator: ItemContainerGenerator) {
    if (this.container === null && this.index < 0) {
      this._container = generator.containerFromItem(this.item)
    }

    if (this.index < 0 && this.container !== null) {
      this._index = generator.indexFromContainer(this.container)
    }

    if (this.container === null && this.index >= 0) {
      this._container = generator.containerFromIndex(this.index)
    }

    if (this.container === CONTAINERS.SENTINEL && this.index >= 0) {
      this.container = null;   // caller explicitly wants null container
    }

    return this;
  }

  public reset(item: unknown) {
    this._item = item;

    return this;
  }

  public static Key(info: ItemInfo) {
    if (info.container === UNRESOLVED) {
      return new ItemInfo(-1, info.item, KEY);
    }

    return info;
  }

  private equalsInfo(info: ItemInfo, matchUnresolved: boolean) {
    if (this.isRemoved || info.isRemoved) {
      return false;
    }

    if (!ItemsControl.Equals(this.item, info.item)) {
      return false
    }

    if (this.container == KEY)
      return matchUnresolved || info.container !== UNRESOLVED;
    else if (info.container === KEY)
      return matchUnresolved || this.container != UNRESOLVED;

    // Unresolved matches nothing
    if (this.container == UNRESOLVED || info.container == UNRESOLVED)
      return false;

    if (this.container === info.container) {
      if (this.container === SENTINEL) {
        return this.index === info.index
      } else {
        return (
          this.index < 0 ||
          info.index < 0 ||
          this.index === info.index
        ) // ~Sentinel => ignore negative indices  
      }
    }

    return (
      this.container === SENTINEL || // sentinel matches non-sentinel
      info.container === SENTINEL ||
      (
        (this.container === null || info.container === null) &&  // null matches non-null
        (this.index < 0 || info.index < 0 /*provided info indices match*/ || this.index === info.index)
      )
    );
  }

  private _item: unknown;
  private _index: number;
  private _container: unknown;
}
