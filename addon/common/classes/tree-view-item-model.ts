import { notifyPropertyChange } from '@ember/object';
import NativeArray from "@ember/array/-private/native-array";

class TreeViewItemModel {
 
  public get item() {
    return this._item;
  }

  public set item(
    value: unknown
  ) {
    if (this._item !== value) {
      this._item = value;
      notifyPropertyChange(this, 'item');
    }
  }

  public get itemsSource() {
    return this._itemsSource;
  }

  public set itemsSource(
    value: NativeArray<unknown> | null
  ) {
    if (this._itemsSource !== value) {
      this._itemsSource = value;
      notifyPropertyChange(this, 'itemsSource');
    }
  }

  public get header() {
    return this._header;
  }

  public set header(
    value: unknown
  ) {
    if (this._header !== value) {
      this._header = value;
      notifyPropertyChange(this, 'header');
    }
  }

  public get isSelected() {
    return this._isSelected;
  }

  public set isSelected(
    value: boolean
  ) {
    if (this._isSelected !== value) {
      this._isSelected = value;
      notifyPropertyChange(this, 'isSelected');
    }
  }

  public get isExpanded() {
    return this._isExpanded;
  }

  public set isExpanded(
    value: boolean
  ) {
    if (this._isExpanded !== value) {
      this._isExpanded = value;
      notifyPropertyChange(this, 'isExpanded');
    }
  }

  private _item: unknown
  private _isExpanded: boolean = false
  private _isSelected: boolean = false
  private _itemsSource: NativeArray<unknown> | null = null
  private _header: unknown
}

export default TreeViewItemModel;