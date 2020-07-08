import ItemsControl, { IItemsControlArgs } from 'ember-ux-core/components/items-control'
import bem, { ClassNamesBuilder } from 'ember-ux-core/utils/bem';
// @ts-ignore
import layout from './template';
import TreeViewItemModel from 'ember-ux-controls/common/classes/tree-view-item-model';
import EmberArray from '@ember/array';
import { IHeaderItemsElement } from 'ember-ux-controls/common/types';
import { A } from '@ember/array';
import { action } from '@ember/object';
import { scheduleOnce } from '@ember/runloop';
import { notifyPropertyChange } from '@ember/object';

export interface ITreeViewArgs extends IItemsControlArgs {
  headerTemplateName?: string,
  getHeader?: (data: unknown) => unknown
  getItems?: (data: unknown) => EmberArray<unknown>
}


export class TreeView extends ItemsControl<ITreeViewArgs> {
  constructor(
    owner: unknown,
    args: ITreeViewArgs,
    props?: ITreeViewArgs
  ) {
    super(owner, args, props);
  }

  public get isExpanded() {
    return this.isRoot || this._isExpanded;
  }

  public set isExpanded(value: boolean) {
    if(this._isExpanded !== value) {
      this._isExpanded = value;
      notifyPropertyChange(this, 'isExpanded');
    }
  }

  public get isRoot() {
    return !(this.args.parentElement instanceof TreeView);
  }

  public get hasItems() {
    return this.items.count > 0;
  }

  public get classNamesBuilder()
    : ClassNamesBuilder {
    return bem('tree-view');
  }

  public get classNames()
    : string {
    if (this.isRoot) {
      return `${this.classNamesBuilder}`;
    }

    return `${this.classNamesBuilder('item')}`;
  }

  public get headerTemplateName() {
    return (
      this.args.headerTemplateName ??
      this.props?.headerTemplateName ??
      'tree-view/header'
    );
  }

  public get itemTemplateName() {
    return (
      super.itemTemplateName ??
      'tree-view'
    );
  }

  public createContainerForItem()
    : TreeViewItemModel {
    return new TreeViewItemModel();
  }

  public prepareItemContainer(
    container: TreeViewItemModel
  ): void {
    let
      item: unknown;

    item = this.readItemFromContainer(container)

    if (this.itemItsOwnContainer(item)) {
      return;
    }

    if (!(container instanceof TreeViewItemModel)) {
      return;
    }

    if (isHeaderItemsElement(item)) {
      container.header = item.header
      container.items = A(item.items);
    } else if (
      typeof this.args.getHeader === 'function' &&
      typeof this.args.getItems === 'function'
    ) {
      container.header = this.args.getHeader(item);
      container.items = this.args.getItems(item)
    } else {
      throw new Error(`Can't extract header and content from item`);
    }
  }

  public clearContainerForItem(
    container: TreeViewItemModel,
    _item: unknown
  ): void {
    container.item = null;
    container.header = null;
    container.items = null;
  }

  public linkContainerToItem(
    container: TreeViewItemModel,
    item: unknown
  ): void {
    container.item = item;
  }

  public readItemFromContainer(
    container: TreeViewItemModel
  ): unknown {
    return container.item;
  }

  @action
  public didInsert() {
    const
      parent = this.parentElement;

    {
      scheduleOnce('afterRender', this, () => {
        if (
          parent instanceof TreeView &&
          parent.hasItemsSource === false
        ) {
          parent.addChild(this);
        }
      });
    }
  }

  @action
  public toggleExpanded() {
    this.isExpanded = !this.isExpanded;
  }

  private _isExpanded: boolean = false;
}

function isHeaderItemsElement(obj: any)
  : obj is IHeaderItemsElement {
  return (
    typeof (<IHeaderItemsElement>obj).items !== 'undefined' &&
    typeof (<IHeaderItemsElement>obj).header !== 'undefined'
  );
}

export default TreeView.RegisterTemplate(layout);