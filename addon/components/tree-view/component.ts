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
import { assign } from '@ember/polyfills';

// @ts-ignore
import layout from './template';

export class TreeViewGlobalChangedEventArgs {
  constructor(
    public sender: TreeView,
    public value: boolean
  ) { }
}

export interface ITreeViewArgs extends ISelectItemsControlArgs {
  item?: unknown
  header?: unknown,
  container?: TreeViewItemModel,
  headerTemplateName?: string,
  headerPresenterTemplateName?: string,
  expanderTemplateName?: string,
  hasItemsSource?: boolean
  getHeader?: (data: unknown) => unknown
  getItems?: (data: unknown) => EmberArray<unknown>
}

export class TreeView extends SelectItemsControl<ITreeViewArgs> {
  constructor(
    owner: unknown,
    args: ITreeViewArgs,
    props?: ITreeViewArgs
  ) {
    super(owner, args, assign({
      itemTemplateName: 'tree-view',
      headerTemplateName: 'tree-view/header',
      headerPresenterTemplateName: 'tree-view/header/presenter',
      expanderTemplateName: 'tree-view/expander'
    }, props ?? {}));
  }

  public get header()
    : unknown {
    return this.args.header;
  }

  public get container() {
    return (
      this.args.container ??
      this
    )
  }

  public get item()
    : unknown {
    return (
      this.args.item ??
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
        if (
          this.multipleSelectionEnable &&
          this.hasChilds &&
          this.selectedItems.count !== this.items.count
        ) {
          this.selectAllInternal();
        }
      } else {
        if (
          this.hasChilds &&
          this.multipleSelectionEnable
        ) {
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
      this.props?.headerTemplateName
    );
  }

  public get headerPresenterTemplateName() {
    return (
      this.args.headerPresenterTemplateName ??
      this.props?.headerPresenterTemplateName
    );
  }

  public get expanderTemplateName() {
    return (
      this.args.expanderTemplateName ??
      this.props?.expanderTemplateName
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

  public onSelectionChanged(
    selectedItems: unknown[],
    unselectedItems: unknown[]
  ) {
    super.onSelectionChanged(
      selectedItems,
      unselectedItems
    );

    if (this.multipleSelectionEnable === false) {
      return;
    }

    if (this.parentElement instanceof TreeView) {
      if (this.isSelected) {
        if (this.selectedItems.count === 0) {
          this.parentElement.onUnselect(this.container);
        }
      } else {
        if (this.selectedItems.count === this.items.count) {
          this.parentElement.onSelect(this.container);
        }
      }
    }
  }

  @action
  public didInsert() {
    const
      parent = this.parentElement;

    if (parent instanceof TreeView) {

      this.setRoot(parent);

      scheduleOnce('afterRender', this, () => {
        if (parent.hasItemsSource === false) {
          parent.addChild(this);
        }
      });
    }
  }

  public willDestroy() {
    if (this.isDestroyed) {
      return;
    }

    this.unsetRoot();
  }

  private unsetRoot() {
    let
      root: TreeView | null;

    root = this._root;
    if (!root) {
      return;
    }

    root.eventHandler.removeEventListener(
      this,
      TreeViewGlobalChangedEventArgs
    );
  }

  private setRoot(parent: TreeView) {
    let
      root: TreeView | undefined;

    if (parent.isRoot) {
      root = parent;
    } else {
      root = this.findRoot(parent);
    }

    if (root) {
      root.eventHandler.addEventListener(
        this,
        TreeViewGlobalChangedEventArgs,
        this.onGlobalSelectionChanged
      );

      this._root = root;
    }
  }

  private onGlobalSelectionChanged(
    args: TreeViewGlobalChangedEventArgs
  ) {
    if (
      !this.multipleSelectionEnable &&
      this.parentElement instanceof TreeView &&
      args.sender.parentElement !== this.parentElement
    ) {
      this.parentElement.unselectAllInternal();
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
  public changeSelection(
    isSelected: boolean
  ) {
    if (this.parentElement instanceof TreeView) {
      if (isSelected) {
        this.parentElement.onSelect(this.container);
      } else {
        this.parentElement.onUnselect(this.container);
      }

      if (this._root) {
        this._root.eventHandler.emitEvent(
          new TreeViewGlobalChangedEventArgs(
            this,
            isSelected
          )
        );
      }
    }
  }

  protected findRoot(
    parentElement?: object
  ): TreeView | undefined {
    let
      root: TreeView | undefined;

    if (!parentElement) {
      return root;
    }

    if (
      parentElement instanceof TreeView &&
      parentElement.isRoot
    ) {
      root = parentElement;
    } else {
      root = this.findRoot(
        Reflect.get(
          parentElement,
          'parentElement'
        )
      );
    }

    return root;
  }

  private _root: TreeView | null = null;
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