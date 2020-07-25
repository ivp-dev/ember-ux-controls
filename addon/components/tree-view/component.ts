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
  header?: unknown,
  isSelected?: boolean,
  isExpanded?: boolean,
  hasSelectedNodes?: boolean,
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

  public get item() {
    return this;
  }

  @computed('args.container')
  public get container()
    : TreeViewItemModel | TreeView {
    return this.args.container ?? this;
  }

  @computed('args.container.header')
  public get header() {
    if (this.container instanceof TreeView) {
      return this.args.header;
    }

    return this.container.header;
  }

  @computed('args.container.isSelected')
  public get isSelected() {
    if (this.container instanceof TreeView) {
      return this._isSelected;
    }
    return !!this.args.isSelected;
  }

  public set isSelected(
    value: boolean
  ) {
    if (this._isSelected !== value) {
      this._isSelected = value;
      notifyPropertyChange(this, 'isSelected');
    }
  }

  @computed('args.container.hasSelectedNodes')
  public get hasSelectedNodes() {
    if (this.container instanceof TreeView) {
      return this._hasSelectedNodes;
    }
    return !!this.args.hasSelectedNodes;
  }

  public set hasSelectedNodes(
    value: boolean
  ) {
    if (this._hasSelectedNodes !== value) {
      this._hasSelectedNodes = value;
      notifyPropertyChange(this, 'hasSelectedNodes');
    }
  }

  @computed('args.container.isExpanded')
  public get isExpanded() {
    if (this.container instanceof TreeView) {
      return this._isExpanded;
    }
    return !!this.args.isExpanded;
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
    'hasSelectedNodes',
    'multipleSelectionEnable'
  )
  public get classNames()
    : string {
    if (this.isRoot) {
      return `${this.classNamesBuilder}`;
    }

    return `${this.classNamesBuilder('item', {
      [`$selected`]: this.isSelected,
      [`$partial-selected`]: (
        this.multipleSelectionEnable &&
        this.isSelected === false &&
        this.hasSelectedNodes
      )
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

  public itemItsOwnContainer(
    item: unknown
  ): item is TreeView {
    return item instanceof TreeView;
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
    container: TreeViewItemModel | TreeView
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

  public onSelectionChanged(
    selectedItems: unknown[],
    unselectedItems: unknown[]
  ) {
    if (
      this.multipleSelectionEnable &&
      this.hasChilds &&
      this.logicalParent instanceof TreeView) {
      if (this.selectedItems.count < this.items.count) {
        this.logicalParent.onUnselect(this.container)
      } else {
        this.logicalParent.onSelect(this.container);
      }
    }

    super.onSelectionChanged(
      selectedItems,
      unselectedItems
    );
  }

  @action
  public didInsert() {
    if (
      !(this.logicalParent instanceof TreeView)
    ) {
      return;
    }

    this.root = this.findParent(this, parent =>
      parent !== null && parent.isRoot
    );

    if (!this.root) {
      throw new Error('Can`t find root');
    }

    this.root.eventHandler.addEventListener(
      this,
      TreeViewRootSelectionChangedEventArgs,
      this.onRootSelectionChanged
    );

    next(this, () => {
      if (
        this.logicalParent instanceof TreeView &&
        this.logicalParent.hasItemsSource === false
      ) {
        this.logicalParent.addChild(this);
      }
    })
  }

  public willDestroy() {
    if (this.isDestroyed) {
      return;
    }

    if (this.root instanceof TreeView) {
      this.root.eventHandler.removeEventListener(
        this,
        TreeViewRootSelectionChangedEventArgs
      );
    }
  }

  private onRootSelectionChanged(
    args: TreeViewRootSelectionChangedEventArgs
  ) {
    let {
      sender, value } = args,
      head: TreeView | null;

    if (!(this.logicalParent instanceof TreeView)) {
      return;
    }

    if (
      this.multipleSelectionEnable === false &&
      this.logicalParent !== sender.logicalParent &&
      this.logicalParent.hasChilds
    ) {
      this.logicalParent.unselectAllInternal();
    }

    head = this.findParent(
      this.logicalParent,
      parent =>
        parent === sender
    );

    if (
      this.multipleSelectionEnable &&
      this.isRoot === false &&
      head !== null
    ) {
      if (value) {
        this.logicalParent.onSelect(this.container);

      } else {
        this.logicalParent.onUnselect(this.container);
      }
    }

    this.updateHasSelectedNodes(sender, sender.isSelected);
  }

  @action
  public toggleExpander(
    event: Event
  ) {
    this.container.isExpanded = !this.container.isExpanded;
    event.preventDefault();
  }

  @action
  public changeSelection(
    isSelected: boolean,
  ) {
    if (!(this.logicalParent instanceof TreeView)) {
      return;
    }

    if (isSelected) {
      this.logicalParent.onSelect(this.container);
    } else {
      this.logicalParent.onUnselect(this.container);
    }

    if (!this.root) {
      return;
    }

    this.root.eventHandler.emitEvent(
      new TreeViewRootSelectionChangedEventArgs(
        this,
        isSelected
      )
    );
  }

  protected updateHasSelectedNodes(
    sender: TreeView,
    value: boolean
  ) {
    let
      parent: unknown;

    parent = sender.logicalParent;
    if (parent instanceof TreeView) {
      parent.hasSelectedNodes = value;
      this.updateHasSelectedNodes(parent, value);
    }
  }

  protected findParent(
    parentElement: any,
    filter: (element: TreeView | null) => boolean
  ): TreeView | null {
    let
      result: TreeView | null = null;

    if (!parentElement) {
      return result;
    }

    if (
      parentElement instanceof TreeView &&
      filter(parentElement)
    ) {
      result = parentElement;
    } else {
      result = this.findParent(
        Reflect.get(
          parentElement,
          'logicalParent'
        ),
        filter
      );
    }

    return result;
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
  private _hasSelectedNodes: boolean = false;
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