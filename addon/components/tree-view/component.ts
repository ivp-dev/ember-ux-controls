import ItemsControl, { IItemsControlArgs } from 'ember-ux-core/components/items-control'
import bem, { ClassNamesBuilder } from 'ember-ux-core/utils/bem';
import TreeViewItemModel from 'ember-ux-controls/common/classes/tree-view-item-model';
import EmberArray from '@ember/array';
import { IHeaderedElement, IItemsElement } from 'ember-ux-controls/common/types';
import { A } from '@ember/array';
import { action } from '@ember/object';
import { scheduleOnce } from '@ember/runloop';
import { notifyPropertyChange } from '@ember/object';
import { TreeViewPane } from 'ember-ux-controls/components/tree-view/pane/component'
// @ts-ignore
import layout from './template';



export interface ITreeViewArgs extends IItemsControlArgs {
  header?: unknown,
  container?: TreeViewItemModel,
  headerTemplateName?: string,
  expanderTemplateName?: string,
  hasItemsSource?: boolean
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

  public get header()
    : unknown {
    return (
      this.args.container?.header ??
      this.args.header
    );
  }

  public get container() {
    return (
      this.args.container &&
      this.props?.container
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