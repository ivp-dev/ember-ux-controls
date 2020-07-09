import SelectItemsControl, { ISelectItemsControlArgs } from 'ember-ux-core/components/select-items-control'
import bem, { ClassNamesBuilder } from 'ember-ux-core/utils/bem';
import TreeViewItemModel from 'ember-ux-controls/common/classes/tree-view-item-model';
import EmberArray from '@ember/array';
import { IHeaderedElement, IItemsElement } from 'ember-ux-controls/common/types';
import { A } from '@ember/array';
import { action } from '@ember/object';
import { scheduleOnce } from '@ember/runloop';
import { notifyPropertyChange } from '@ember/object';
import { TreeViewPane } from 'ember-ux-controls/components/tree-view/pane/component';
import { computed } from '@ember/object';
// @ts-ignore
import layout from './template';



export interface ITreeViewArgs extends ISelectItemsControlArgs {
  header?: unknown,
  container?: TreeViewItemModel,
  headerTemplateName?: string,
  expanderTemplateName?: string,
  hasItemsSource?: boolean
  multiSelectionEnable?: boolean,
  getHeader?: (data: unknown) => unknown
  getItems?: (data: unknown) => EmberArray<unknown>
}

export class TreeView extends SelectItemsControl<ITreeViewArgs> {
  constructor(
    owner: unknown,
    args: ITreeViewArgs,
    props?: ITreeViewArgs
  ) {
    super(owner, args, props);
  }

  public get header()
    : unknown {
    return (
      this.args.container?.header ??
      this.args.header
    );
  }

  public get container() {
    return (
      this.args.container ?? this
    )
  }

  public get item()
    : unknown {
    return (
      this.args.container?.item ??
      this
    );
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

  public get isSelected() {
    return this._isSelected;
  }

  public set isSelected(
    value: boolean
  ) {
    if (this._isSelected !== value) {
      this._isSelected = value;

      if (this._isSelected) {
        if (this.hasChilds && this.selectedItems.count !== this.items.count) {
          this.selectAllInternal();
        }
      } else {
        if (this.hasChilds) {
          this.unselectAllInternal();
        }
      }

      notifyPropertyChange(this, 'isSelected');
    }
  }

  public get isRoot() {
    return !(
      this.args.parentElement instanceof TreeView || (
        this.args.parentElement instanceof TreeViewPane &&
        this.args.parentElement.parentTreeView
      )
    );
  }

  public get hasChilds() {
    return this.items.count > 0;
  }

  public get classNamesBuilder()
    : ClassNamesBuilder {
    return bem('tree-view');
  }

  @computed('isRoot', 'isSelected')
  public get classNames()
    : string {
    if (this.isRoot) {
      return `${this.classNamesBuilder}`;
    }

    return `${this.classNamesBuilder('item', {
      [`$selected`]: this.isSelected
    })}`;
  }

  public get headerTemplateName() {
    return (
      this.args.headerTemplateName ??
      this.props?.headerTemplateName ??
      'tree-view/header/presenter'
    );
  }

  public get expanderTemplateName() {
    return (
      this.args.expanderTemplateName ??
      this.props?.expanderTemplateName ??
      'tree-view/expander'
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

  public linkContainerToItem(
    container: TreeViewItemModel,
    item: unknown
  ): void {
    if (
      !this.itemItsOwnContainer(item) &&
      container instanceof TreeViewItemModel
    ) {
      container.item = item;
    }
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

    if (isHeaderElement(item)) {
      container.header = item.header
    } else if (typeof this.args.getHeader === 'function') {
      container.header = this.args.getHeader(item);
    }

    if (isItemsElement(item)) {
      container.items = A(item.items)
    } else if (typeof this.args.getItems === 'function') {
      container.items = this.args.getItems(item);
    }
  }

  public clearContainerForItem(
    container: TreeViewItemModel
    /*item: unknown*/
  ): void {
    container.item = null;
    container.header = null;
    container.items = null;
  }

  public readItemFromContainer(
    container: TreeViewItemModel
  ): unknown {
    return container.item;
  }

  public onSelectionChanged(selectedItems: unknown[], unselectedItems: unknown[]) {
    super.onSelectionChanged(selectedItems, unselectedItems);
    if(this.parentElement instanceof TreeView) {
      if(this.isSelected) {
        if(this.selectedItems.count === 0) {
          this.parentElement.onUnselect(this.container);
        }
      } else {
        if(this.selectedItems.count === this.items.count) {
          this.parentElement.onSelect(this.container);
        }
      }
    }  
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
  public toggleExpander(
    event: Event
  ) {
    this.isExpanded = !this.isExpanded;
    event.preventDefault();
  }

  @action
  public changeSelection(isSelected: boolean) {
    if (this.parentElement instanceof TreeView) {
      if (isSelected) {
        this.parentElement.onSelect(this.container);
      } else {
        this.parentElement.onUnselect(this.container);
      }
    }
  }

  private _isSelected: boolean = false;
  private _isExpanded: boolean = false;
}

function isItemsElement(obj: any)
  : obj is IItemsElement {
  return (
    typeof (<IItemsElement>obj).items !== 'undefined'
  );
}

function isHeaderElement(obj: any)
  : obj is IHeaderedElement {
  return (
    typeof (<IHeaderedElement>obj).header !== 'undefined'
  );
}

export default TreeView.RegisterTemplate(layout);