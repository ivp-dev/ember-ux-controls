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

type TreeViewItem = TreeView;

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

  protected get head() {
    return this._head;
  }

  protected set head(
    value: TreeView | null
  ) {
    if (this._head !== value) {
      this._head = value;
    }
  }

  protected get nodeSelectionChanger()
    : NodeSelectionChanger {
    if (!this.root) {
      throw new Error('Root node should be set');
    }

    if (!this.root._nodeSelectionChanger) {
      this.root._nodeSelectionChanger = new TreeView.NodeSelectionChanger(this.root);
    }
    return this.root._nodeSelectionChanger;
  }

  public itemItsOwnContainer(
    item: unknown
  ): item is TreeViewItem {
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

  public onSelectionChanged(
    selectedItems: unknown[],
    unselectedItems: unknown[]
  ) {

    if (this.nodeSelectionChanger.isActive) {
      return;
    }

    if (
      this.multipleSelectionEnable &&
      this.hasChilds &&
      this.logicalParent instanceof TreeView
    ) {
      if (this.selectedItems.count < this.items.count && this.isSelected) {
        // unselect if not all childs was selected
        this.nodeSelectionChanger.unselect(this)
      } else if(this.selectedItems.count === this.items.count && !this.isSelected) {
        // select if all childs was selected
        this.nodeSelectionChanger.select(this)
      }
    }

    super.onSelectionChanged(
      selectedItems,
      unselectedItems
    );
  }

  @action
  public didInsert() {
    if (!(this.logicalParent instanceof TreeView)) {
      this.root = this;
    } else {
      this.root = this.findParent(this.logicalParent, parent =>
        parent.isRoot
      );

      this.head = this.findParent(this.logicalParent, parent =>
        parent.logicalParent instanceof TreeView &&
        parent.logicalParent.isRoot
      );
    }

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
      sender, value
    } = args;

    if (!this.nodeSelectionChanger.isActive) {
      throw new Error('NodeSelectionChanger should be active');
    }

    if (!(this.logicalParent instanceof TreeView)) {
      return;
    }

    if (
      this.multipleSelectionEnable === false &&
      this !== sender &&
      this.isSelected
    ) {
      // clear old selection if multipleSelection disabled
      this.nodeSelectionChanger.unselect(this);
    }

    if (this.multipleSelectionEnable === false) {
      return;
    }

    if (
      this.hasParent(sender) &&
      this.isSelected !== value
    ) {
      // current node is child of sender
      if (value) {
        this.nodeSelectionChanger.select(this);
      } else {
        this.nodeSelectionChanger.unselect(this);
      }
    }
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
    value: boolean,
  ) {
    if (!this.root || !(this.logicalParent instanceof TreeView)) {
      return;
    }

    if(!this.hasChilds) {
      if (value) {
        this.logicalParent.onSelect(this.container)
      } else {
        this.logicalParent.onUnselect(this.container)
      }
      return;
    }

    try {
      this.nodeSelectionChanger.begin();
      if (value) {
        this.nodeSelectionChanger.select(this)
      } else {
        this.nodeSelectionChanger.unselect(this)
      }

      this.root.eventHandler.emitEvent(
        new TreeViewRootSelectionChangedEventArgs(
          /*sender*/ this,
          /*value */ value
        )
      );
    } finally {
      this.nodeSelectionChanger.end();
    }
  }

  private hasParent(searchedParent: any) {
    return this.findParent(
      this.logicalParent as TreeView,
      parent => parent === searchedParent
    ) !== null
  }

  private findParent(
    parentElement: TreeViewItem,
    filter: (element: TreeViewItem) => boolean
  ): TreeViewItem | null {

    while (parentElement) {
      if (filter(parentElement)) {
        return parentElement;
      }
      parentElement = parentElement.logicalParent as TreeView
    }
    //did't find 
    return null;
  }

  private static NodeSelectionChanger = class {
    constructor(
      public owner: TreeViewItem
    ) {
      this.isActive = false;
      this.toSelect = [];
      this.toUnselect = [];
    }

    public toSelect: Array<TreeViewItem>
    public toUnselect: Array<TreeViewItem>
    public isActive: boolean;

    public select(node: TreeViewItem) {
      if (node.logicalParent instanceof TreeView) {
        node.logicalParent.onSelect(node.container);
      }

      this.toSelect.push(node);
    }

    public unselect(node: TreeViewItem) {
      if (node.logicalParent instanceof TreeView) {
        node.logicalParent.onUnselect(node.container);
      }

      this.toUnselect.push(node);
    }

    public begin() {
      this.cleanup();
      this.isActive = true;
    }

    public end() {
      try {

      } finally {
        this.isActive = false;
        this.cleanup();
      }
    }

    public cleanup() {
      this.toSelect.length = 0;
      this.toUnselect.length = 0;
    }
  }

  private _nodeSelectionChanger: NodeSelectionChanger | null = null
  private _titleTemplateName: string | null = null
  private _headerTemplateName: string | null = null
  private _expanderTemplateName: string | null = null
  private _root: TreeView | null = null;
  private _isSelected: boolean = false;
  private _hasSelectedNodes: boolean = false;
  private _isExpanded: boolean = false;
  private _head: TreeViewItem | null = null;
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

type NodeSelectionChanger = {
  isActive: boolean;
  toSelect: Array<TreeViewItem>
  toUnselect: Array<TreeViewItem>
  begin: () => void
  end: () => void
  select: (node: TreeViewItem) => void
  unselect: (node: TreeViewItem) => void
  cleanup: () => void
}

export default TreeView.RegisterTemplate(layout);