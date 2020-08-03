import SelectItemsControl, { ISelectItemsControlArgs } from 'ember-ux-core/components/select-items-control';
import { ClassNamesBuilder } from 'ember-ux-core/utils/bem';
import { isHeaderElement, isItemsElement, TreeView } from 'ember-ux-controls/components/tree-view/component'
import { reads } from '@ember/object/computed';
import { A } from '@ember/array';
import { TreeViewSelectionChangedEventArgs } from 'ember-ux-controls/components/tree-view/component';
import TreeViewItemModel from 'ember-ux-controls/common/classes/tree-view-item-model';
import { notifyPropertyChange } from '@ember/object';
import { action } from '@ember/object';
import { next } from '@ember/runloop';
import { computed } from '@ember/object';
import ItemsControl from 'ember-ux-core/components/items-control';
// @ts-ignore
import layout from './template';



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

  @reads('args.header')
  public header?: unknown

  @reads('args.titleTemplateName')
  public titleTemplateName?: string

  @reads('args.headerTemplateName')
  public headerTemplateName?: string

  @reads('args.expanderTemplateName')
  public expanderTemplateName?: string

  @reads('args.classNamesBuilder')
  public classNamesBuilder?: ClassNamesBuilder

  @reads('args.getHeader')
  public getHeader?: (data: unknown) => unknown

  @reads('args.getItems')
  public getItems?: (data: unknown) => Array<unknown>


  public get item() {
    return this;
  }

  public get hasChilds() {
    return this.items.count > 0;
  }

  public get classNames()
    : string {
    if (this.classNamesBuilder) {
      return `${this.classNamesBuilder('item', {
        '$selected': this.isSelected
      })}`;
    }

    return ''
  }

  public get container()
    : TreeViewItemModel | this {
    return this.args.container ?? this;
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

  protected get root() {
    if (!this._root) {
      throw new Error('Root was not found');
    }

    return this._root;
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
  public toggleExpander() {
    this.container.isExpanded = !this.container.isExpanded;
  }

  @action
  changeSelection(value: boolean) {
    if (this.logicalParent instanceof SelectItemsControl) {
      if (value) {
        this.logicalParent.onSelect(this.container);
        this.root.nodeSelectionChanger.select(this);
      } else {
        this.logicalParent.onUnselect(this.container);
        this.root.nodeSelectionChanger.unselect(this);
      }
    }
  }

  @action
  onRootSelectionChanged(
    sender: TreeViewItem,
    args: TreeViewSelectionChangedEventArgs
  ) {
    debugger
  }

  @action
  public didInsert() {
    this._root = this.findRoot();

    this._root.addEventListener(
      this,
      TreeViewSelectionChangedEventArgs,
      this.onRootSelectionChanged
    )

    next(this, () => {
      if (
        this.logicalParent instanceof ItemsControl &&
        this.logicalParent.hasItemsSource === false
      ) {
        this.logicalParent.addChild(this);
      }
    })
  }

  private findRoot()
    : TreeView {
    let
      visualParent = this.visualParent;

    while (visualParent) {
      if (visualParent instanceof TreeView) {
        return visualParent;
      }

      visualParent = Reflect.get(visualParent, 'visualParent');
    }

    throw new Error('Root was not found');
  }

  private _root: TreeView | null = null
  private _isSelected: boolean = false;
  private _isExpanded: boolean = false;
}

export default TreeViewItem.RegisterTemplate(layout);