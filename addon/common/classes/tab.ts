import { ISelectable } from 'ember-ux-core/common/types'
import { TabControl } from 'ember-ux-controls/components/tab-control/component';
import { notifyPropertyChange } from '@ember/object';

export default class Tab implements ISelectable {
  constructor(
    public owner: TabControl
  ) { }

  public get item() {
    return this._item;
  }

  public set item(value: unknown) {
    if (this._item !== value) {
      this._item = value;
      notifyPropertyChange(this, 'item');
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

  public get content() {
    return this._content;
  }

  public set content(
    value: unknown
  ) {
    if (this._content !== value) {
      this._content = value;
      notifyPropertyChange(this, 'content');
    }
  }

  public get isSelected() {
    return this._isSelected;
  }

  public set isSelected(
    value: boolean
  ) {
    if (this._isSelected != value) {
      this._isSelected = value;
      notifyPropertyChange(this, 'isSelected');
    }
  }

  private _header: unknown = null
  private _content: unknown = null
  private _item: unknown = null
  private _isSelected = false;
}