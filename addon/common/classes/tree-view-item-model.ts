import EmberArray from '@ember/array';
import { notifyPropertyChange } from '@ember/object';

class TreeViewItemModel {

  public get item() {
    return this._item;
  }

  public set item(value: unknown) {
    if (this._item !== value) {
      this._item = value;
      notifyPropertyChange(this, 'item');
    }
  }

  public get items() {
    return this._items;
  }
  public set items(value: EmberArray<unknown> | null) {
    if (this._items !== value) {
      this._items = value;
      notifyPropertyChange(this, 'items');
    }
  }

  public get header() {
    return this._header;
  }
  public set header(value: unknown) {
    if (this._header !== value) {
      this._header = value;
      notifyPropertyChange(this, 'header');
    }
  }

  private _items: EmberArray<unknown> | null = null
  private _header: unknown
  private _item: unknown
}

export default TreeViewItemModel;