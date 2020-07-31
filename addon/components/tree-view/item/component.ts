import SelectItemsControl, { ISelectItemsControlArgs } from 'ember-ux-core/components/select-items-control';
import { ClassNamesBuilder } from 'ember-ux-core/utils/bem';
import { isHeaderElement, isItemsElement } from 'ember-ux-controls/components/tree-view/component'
import { computed } from '@ember/object';
import { A } from '@ember/array';
import TreeViewItemModel from 'ember-ux-controls/common/classes/tree-view-item-model';
import { notifyPropertyChange } from '@ember/object';
import { action } from '@ember/object';
import { next } from '@ember/runloop';
// @ts-ignore
import layout from './template';
import ItemsControl from 'ember-ux-core/components/items-control';


interface ITreeViewItemArgs extends ISelectItemsControlArgs {
  header?: unknown,
  isSelected?: boolean
  isExpanded?: boolean
  titleTemplateName?: string,
  headerTemplateName?: string,
  expanderTemplateName?: string,
  container?: TreeViewItemModel,
  classNamesBuilder?: ClassNamesBuilder
  getHeader?: (data: unknown) => unknown
  getItems?: (data: unknown) => Array<unknown>
}

export class TreeViewItem extends SelectItemsControl<ITreeViewItemArgs> {
  
  public get item() {
    return this;
  }

  public get hasChilds() {
    return this.items.count > 0;
  }

  public get classNamesBuilder() {
    return this.args.classNamesBuilder;
  }

  public get classNames()
    : string {
    if (this.classNamesBuilder) {
      return `${this.classNamesBuilder('item')}`;
    }

    return ''
  }

  @computed('args.container')
  public get container()
    : TreeViewItemModel | this {
    return this.args.container ?? this;
  }

  @computed('args.header')
  public get header() {
    return this.args.header;
  }

  @computed('args.titleTemplateName')
  public get titleTemplateName() {
    return this.args.titleTemplateName;
  }

  @computed('args.expanderTemplateName')
  public get expanderTemplateName() {
    return this.args.expanderTemplateName;
  }

  @computed('args.headerTemplateName')
  public get headerTemplateName() {
    return  this.args.headerTemplateName;
  }

  @computed('args.isSelected')
  public get isSelected() {
    return this.args.isSelected ?? this._isSelected
  }

  public set isSelected(
    value: boolean
  ) {
    if (this._isSelected !== value) {
      this._isSelected = value;
      notifyPropertyChange(this, 'isSelected');
    }
  }

  @computed('args.isExpanded')
  public get isExpanded() {
    return this.args.isExpanded ?? this._isExpanded
  }

  public set isExpanded(
    value: boolean
  ) {
    if (this._isExpanded !== value) {
      this._isExpanded = value;
      notifyPropertyChange(this, 'isExpanded');
    }
  }

  public itemItsOwnContainer(
    item: unknown
  ): item is TreeViewItem {
    return item instanceof TreeViewItem;
  }

  public createContainerForItem()
    : TreeViewItemModel {
    return new TreeViewItemModel();
  }

  public linkContainerToItem(
    container: TreeViewItemModel,
    item: unknown
  ): void {
    if (!this.itemItsOwnContainer(item)) {
      container.item = item;
    }
  }

  public prepareItemContainer(
    container: TreeViewItemModel
  ): void {
    let
      item: unknown;

    item = this.readItemFromContainer(container);

    if (this.itemItsOwnContainer(item)) {
      return;
    }

    if (typeof this.args.getHeader === 'function') {
      container.header = this.args.getHeader(item);
    } else if (isHeaderElement(item)) {
      container.header = item.header
    }

    if (typeof this.args.getItems === 'function') {
      container.itemsSource = A(this.args.getItems(item))
    } else if (isItemsElement(item)) {
      container.itemsSource = A(item.items)
    }
  }

  public clearContainerForItem(
    container: TreeViewItemModel | TreeViewItem
    /*item: unknown*/
  ): void {
    if (container instanceof TreeViewItemModel) {
      container.item = null;
      container.header = null;
    }
  }

  public readItemFromContainer(
    container: TreeViewItemModel
  ): unknown {
    return container.item;
  }

  @action
  public toggleExpander(
    event: Event
  ) {
    this.container.isExpanded = !this.container.isExpanded;
    event.preventDefault();
  }

  @action
  public didInsert() {
    next(this, () => {
      if (
        this.logicalParent instanceof ItemsControl &&
        this.logicalParent.hasItemsSource === false
      ) {
        this.logicalParent.addChild(this);
      }
    })
  }

  private _isSelected: boolean = false;
  private _isExpanded: boolean = false;
}

export default TreeViewItem.RegisterTemplate(layout);