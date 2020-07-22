import SelectItemsControl, { ISelectItemsControlArgs } from 'ember-ux-core/components/select-items-control'
import bem, { ClassNamesBuilder } from 'ember-ux-core/utils/bem';
import TreeViewItemModel from 'ember-ux-controls/common/classes/tree-view-item-model';
import { IHeaderedElement, IItemsElement } from 'ember-ux-controls/common/types';
import { A } from '@ember/array';
import { action } from '@ember/object';
import { next } from '@ember/runloop';
import { notifyPropertyChange } from '@ember/object';
import { computed } from '@ember/object';

// @ts-ignore
import layout from './template';

export class TreeViewRootSelectionChangedEventArgs {
  constructor(
    public sender: TreeView,
    public value: boolean
  ) { }
}

export interface ITreeViewArgs extends ISelectItemsControlArgs {
  item?: unknown
  header?: unknown,
  isSelected?: boolean,
  container?: TreeViewItemModel,
  titleTemplateName?: string,
  headerTemplateName?: string,
  expanderTemplateName?: string,
  hasItemsSource?: boolean
  getHeader?: (data: unknown) => unknown
  getItems?: (data: unknown) => Array<unknown>
}

export class TreeView extends SelectItemsControl<ITreeViewArgs> {
  constructor(
    owner: unknown,
    args: ITreeViewArgs
  ) {
    super(owner, args);

    this.itemTemplateName = 'tree-view';
    this.titleTemplateName = 'tree-view/title';
    this.headerTemplateName = 'tree-view/header';
    this.expanderTemplateName = 'tree-view/expander';
  }

  @computed('args.{header}')
  public get header()
    : unknown {
    return (
      this._header ??
      this.args.header
    );
  }

  public set header(
    value: unknown
  ) {
    if (this.header !== value) {
      this._header = value;
      notifyPropertyChange(this, 'header')
    }
  }

  @computed('args.container')
  public get container() {
    return (
      this.args.container ??
      this
    )
  }

  @computed('args.{item}')
  public get item()
    : unknown | this {
    return (
      this._item ?? this
    );
  }

  public set item(
    value: unknown
  ) {
    if (this._item !== value) {
      this._item = value;
      notifyPropertyChange(this, 'item');
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

  @computed('args.isSelected')
  public get isSelected() {
    return this.args.isSelected || this._isSelected;
  }

  public set isSelected(
    value: boolean
  ) {
    if (this._isSelected !== value) {
      this._isSelected = value;

      if (this._skipIsSelectedBehavior) {
        return;
      }

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
      this.logicalParent instanceof TreeView
    );
  }

  public get hasChilds() {
    return this.items.count > 0;
  }

  public get classNamesBuilder()
    : ClassNamesBuilder {
    return bem('tree-view');
  }

  @computed(
    'isRoot',
    'isSelected',
    'hasSelectedItems',
    'multipleSelectionEnable'
  )
  public get classNames()
    : string {
    if (this.isRoot) {
      return `${this.classNamesBuilder}`;
    }

    return `${this.classNamesBuilder('item', {
      [`$selected`]: this.isSelected,
      [`$partial-selected`]: this.multipleSelectionEnable && !this.isSelected && this.hasSelectedItems
    })}`;
  }

  @computed('args.titleTemplateName')
  public get titleTemplateName() {
    return (
      this.args.titleTemplateName ??
      this._titleTemplateName
    );
  }

  public set titleTemplateName(
    value: string | null
  ) {
    if (this._titleTemplateName !== value) {
      this._titleTemplateName = value;
      notifyPropertyChange(this, 'titleTemplateName')
    }
  }


  @computed('args.expanderTemplateName')
  public get expanderTemplateName() {
    return (
      this.args.expanderTemplateName ??
      this._expanderTemplateName
    );
  }

  public set expanderTemplateName(
    value: string | null
  ) {
    if (this._expanderTemplateName !== value) {
      this._expanderTemplateName = value;
      notifyPropertyChange(this, 'expanderTemplateName')
    }
  }

  @computed('args.headerTemplateName')
  public get headerTemplateName() {
    return (
      this.args.headerTemplateName ??
      this._headerTemplateName
    );
  }

  public set headerTemplateName(
    value: string | null
  ) {
    if (this._headerTemplateName !== value) {
      this._headerTemplateName = value;
      notifyPropertyChange(this, 'headerTemplateName')
    }
  }

  protected get root() {
    return this._root;
  }

  protected set root(
    value: TreeView | null
  ) {
    if (this._root !== value) {
      this._root = value;
    }
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
      container instanceof TreeViewItemModel ||
      container instanceof TreeView
    ) {
      container.item = item;
    }
  }

  public prepareItemContainer(
    container: TreeViewItemModel | TreeView
  ): void {
    let
      item: unknown;

    item = this.readItemFromContainer(container)

    if (this.itemItsOwnContainer(item)) {
      return;
    }

    if (typeof this.args.getHeader === 'function') {
      container.header = this.args.getHeader(item);
    } else if (isHeaderElement(item)) {
      container.header = item.header
    }

    if (typeof this.args.getItems === 'function') {
      if (container instanceof TreeViewItemModel) {
        container.items = A(this.args.getItems(item))
      } else {
        container.itemsSource = A(this.args.getItems(item))
      }
    } else if (isItemsElement(item)) {
      if (container instanceof TreeViewItemModel) {
        container.items = A(item.items)
      } else {
        container.itemsSource = A(item.items)
      }
    }
  }

  public clearContainerForItem(
    container: TreeViewItemModel
    /*item: unknown*/
  ): void {
    container.item = null;
    container.header = null;
  }

  public readItemFromContainer(
    container: TreeViewItemModel | TreeView
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

    if (this.logicalParent instanceof TreeView) {
      if (this.isSelected) {
        if (this.selectedItems.count === 0) {
          this.logicalParent.onUnselect(this.container);
        } else if (this.selectedItems.count < this.items.count) {
          try {
            this._skipIsSelectedBehavior = true;
            this.logicalParent.onUnselect(this.container);
          } finally {
            this._skipIsSelectedBehavior = false;
          }
        }
      } else {
        if (this.selectedItems.count === this.items.count) {
          this.logicalParent.onSelect(this.container);
        }
      }
    }
  }

  @action
  public didInsert() {
    const
      parent = this.logicalParent;

    if (parent instanceof TreeView) {

      this.setRoot(parent);

      next(this, () => {
        if (parent.hasItemsSource === false) {
          parent.addChild(this);
        }
      })
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
      TreeViewRootSelectionChangedEventArgs
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
        TreeViewRootSelectionChangedEventArgs,
        this.onRootSelectionChanged
      );

      this.root = root;
    }
  }

  private onRootSelectionChanged(
    args: TreeViewRootSelectionChangedEventArgs
  ) {
    if (
      !this.multipleSelectionEnable &&
      this.logicalParent instanceof TreeView &&
      args.sender.logicalParent !== this.logicalParent
    ) {
      this.logicalParent.unselectAllInternal();
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
    if (
      this.logicalParent instanceof TreeView
    ) {
      if (isSelected) {
        this.logicalParent.onSelect(this.container);
      } else {
        this.logicalParent.onUnselect(this.container);
      }

      if (this.root) {
        this.root.eventHandler.emitEvent(
          new TreeViewRootSelectionChangedEventArgs(
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
          'logicalParent'
        )
      );
    }

    return root;
  }

  private _titleTemplateName: string | null = null
  private _headerTemplateName: string | null = null
  private _expanderTemplateName: string | null = null

  private _root: TreeView | null = null;
  private _isSelected: boolean = false;
  private _isExpanded: boolean = false;
  private _skipIsSelectedBehavior: boolean = false;
  private _item: unknown
  private _header: unknown
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