import SelectItemsControl, { ISelectItemsControlArgs } from 'ember-ux-core/components/select-items-control';
import { ClassNamesBuilder } from 'ember-ux-core/utils/bem';
import { isHeaderElement, isItemsElement, TreeView } from 'ember-ux-controls/components/tree-view/component'
import { reads } from '@ember/object/computed';
import { A } from '@ember/array';
import TreeViewItemModel from 'ember-ux-controls/common/classes/tree-view-item-model';
import { notifyPropertyChange } from '@ember/object';
import { action } from '@ember/object';
import { next } from '@ember/runloop';
import { computed } from '@ember/object';
import ItemsControl from 'ember-ux-core/components/items-control';
import { IEventArgs } from 'ember-ux-core/common/classes/-private/event-emmiter';

// @ts-ignore
import layout from './template';

export class TreeViewItemParentSelectionChangedEventArgs {
  constructor(
    public value: boolean
  ) { }
}

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

type NodeSelectionChanger = {
  isActive: boolean;
  select: () => void
  unselect: () => void
  begin: () => void
  cleanup: () => void
  end: () => void
}

export class TreeViewItem extends SelectItemsControl<ITreeViewItemArgs> {
  constructor(
    owner: unknown,
    args: ITreeViewItemArgs
  ) {
    super(owner, args);
  }

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

  public get isRoot() {
    return this.logicalParent instanceof TreeView;
  }

  public get item() {
    return this;
  }

  public get parentNode() {
    if (this.logicalParent instanceof TreeViewItem) {
      return this.logicalParent;
    }

    return null;
  }

  public get hasChilds() {
    return this.items.count > 0;
  }

  public get classNames()
    : string {
    if (!this.classNamesBuilder) {
      return '';
    }

    if (this.isRoot) {
      return `${this.classNamesBuilder}`;
    }

    return `${this.classNamesBuilder('item', {
      '$partial-selected': this.containsSelection,
      '$selected': this.isSelected
    })}`;
  }

  public get containsSelection() {
    return '';
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
    return this.isRoot || (this.args.isExpanded ?? this._isExpanded)
  }

  public set isExpanded(
    value: boolean
  ) {
    if (this._isExpanded !== value) {
      this._isExpanded = value;
      notifyPropertyChange(this, 'isExpanded');
    }
  }

  public get nodeSelectionChanger()
    : NodeSelectionChanger {
    if (!this._nodeSelectionChanger) {
      this._nodeSelectionChanger = new TreeViewItem.NodeSelectionChanger(this);
    }
    return this._nodeSelectionChanger;
  }

  protected get root() {
    return this._root;
  }

  protected set root(
    value: TreeView | null
  ) {
    if (this._root !== value) {
      this._root = value;
      notifyPropertyChange(this, 'root');
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

  public willDestroy() {
    if (this.isDestroyed) {
      return;
    }

    if (this.logicalParent instanceof TreeViewItem) {
      this.logicalParent.removeEventListener(
        this,
        TreeViewItemParentSelectionChangedEventArgs
      )
    }
  }

  @action
  public toggleExpander() {
    this.container.isExpanded = !this.container.isExpanded;
  }

  @action
  public changeSelection(value: boolean) {
    if (!this.root) {
      throw new Error('Root was not found');
    }

    try {
      this.root.nodeSelectionChanger.begin();
      this.changeSelectionInternal(value);
    } finally {
      this.root.nodeSelectionChanger.end();
    }
  }

  @action
  public didInsert() {
    this.root = this.findRoot();

    if (this.logicalParent instanceof TreeViewItem) {
      this.logicalParent.addEventListener(
        this,
        TreeViewItemParentSelectionChangedEventArgs,
        this.onParentSelectionChanged
      );
    }

    next(this, () => {
      if (
        this.logicalParent instanceof ItemsControl &&
        this.logicalParent.hasItemsSource === false
      ) {
        this.logicalParent.addChild(this);
      }
    })
  }

  public changeSelectionInternal(
    newValue: boolean,
    ignoreChildrenNotification: boolean = false
  ) {

    if (
      this.nodeSelectionChanger.isActive
    ) {
      return;
    }

    try {
      this.nodeSelectionChanger.begin();

      if (newValue === true) {
        this.nodeSelectionChanger.select();
      } else {
        this.nodeSelectionChanger.unselect();
      }

      if (
        !ignoreChildrenNotification &&
        this.multipleSelectionEnable
      ) {
        this.notifyChildrenSelectionChanged(newValue);
      };
    } finally {
      this.nodeSelectionChanger.end();
    }
  }

  protected onSelectionChanged(
    selected: unknown[],
    unselected: unknown[]
  ) {
    super.onSelectionChanged(selected, unselected);

    if (this.nodeSelectionChanger.isActive) {
      return;
    }

    if (!this.multipleSelectionEnable) {
      return;
    }

    if (this.isRoot) {
      return;
    }

    this.changeSelectionInternal(
      this.selectedItems.count === this.items.count,
      true
    );
  }

  private updateParentSelection(
    value: boolean
  ) {
    if (this.logicalParent instanceof TreeViewItem) {
      if (value) {
        this.logicalParent.onSelect(this.container);
      } else {
        this.logicalParent.onUnselect(this.container);
      }
    }
  }

  @action
  private onParentSelectionChanged(
    _: TreeViewItem,
    args: TreeViewItemParentSelectionChangedEventArgs
  ) {
    this.changeSelectionInternal(args.value);
  }

  private addEventListener(
    context: TreeViewItem,
    args: IEventArgs,
    callback: (sender: TreeViewItem, args: IEventArgs) => void
  ) {
    this.eventHandler.addEventListener(
      context,
      args,
      callback
    );
  }

  private removeEventListener(
    context: TreeViewItem,
    args: IEventArgs
  ) {
    this.eventHandler.removeEventListener(
      context,
      args
    );
  }

  private notifyChildrenSelectionChanged(value: boolean) {
    let
      args: TreeViewItemParentSelectionChangedEventArgs;

    args = new TreeViewItemParentSelectionChangedEventArgs(value);
    this.eventHandler.emitEvent(this, args);
  }

  private findRoot()
    : TreeView {
    let
      visualParent = this.visualParent;

    while (visualParent) {
      if (
        visualParent instanceof TreeView
      ) {
        return visualParent;
      }

      visualParent = Reflect.get(visualParent, 'visualParent');
    }

    throw new Error('Root was not found');
  }

  private static NodeSelectionChanger = class {
    constructor(
      public owner: TreeViewItem,
    ) {
      this.isActive = false;
    }
    public isActive: boolean;

    public get root() {
      if (!this.owner.root) {
        throw new Error('Root was not found');
      }

      return this.owner.root;
    }

    public begin() {
      if(!this.root.nodeSelectionChanger.isActive) {
        throw new Error('RootSelectionChanger should be active');
      }

      this.isActive = true;
    }

    public cleanup() {
      this.isActive = false;
    }

    public end() {
      this.cleanup();
    }

    public unselect() {
      this.root.onUnselect(this.owner);
      this.owner.updateParentSelection(false);
    }

    public select() {
      this.root.onSelect(this.owner);
      this.owner.updateParentSelection(true);
    }
  }

  private _nodeSelectionChanger: NodeSelectionChanger | null = null
  private _root: TreeView | null = null;
  private _isSelected: boolean = false;
  private _isExpanded: boolean = false;
}

export default TreeViewItem.RegisterTemplate(layout);