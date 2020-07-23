import EmberArray from '@ember/array';
import { notifyPropertyChange } from '@ember/object';
import { TreeView } from 'ember-ux-controls/components/tree-view/component';

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
    value: EmberArray<unknown> | null
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

      if(this.item instanceof TreeView) {
        this.item.onSelectPropertyChanged(value);
      }

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

  public static Create(): TreeViewItemModel {
    let
      instance = new this();

    return new Proxy(instance, {
      get: function (
        target: TreeViewItemModel,
        prop: keyof TreeViewItemModel
      ) {

        if (target.item instanceof TreeView && Reflect.has(target.item, prop)) {
          return Reflect.get(target.item, prop);
        }

        return target[prop];
      },

      set: function (
        target: TreeViewItemModel,
        prop: keyof TreeViewItemModel,
        value: any
      ) {

        if (target.item instanceof TreeView && Reflect.has(target.item, prop)) {
          Reflect.set(target.item, prop, value);
        } else {
          target[prop] = value;
        }

        return true;
      }
    })
  }

  private _item: unknown
  private _isExpanded: boolean = false
  private _isSelected: boolean = false
  private _itemsSource: EmberArray<unknown> | null = null
  private _header: unknown

}

export default TreeViewItemModel;