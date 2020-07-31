import ItemsControl, { IItemsControlArgs } from 'ember-ux-core/components/items-control'
import bem, { ClassNamesBuilder } from 'ember-ux-core/utils/bem';
import TreeViewItemModel from 'ember-ux-controls/common/classes/tree-view-item-model';
import { IHeaderedElement, IItemsElement } from 'ember-ux-controls/common/types';
import { A } from '@ember/array';
import { action } from '@ember/object';
import { notifyPropertyChange } from '@ember/object';
import { computed } from '@ember/object';
import { TreeViewItem } from 'ember-ux-controls/components/tree-view/item/component';

// @ts-ignore
import layout from './template';

export class TreeViewRootSelectionChangedEventArgs {
  constructor(
    public sender: TreeView,
    public value: boolean
  ) { }
}

export interface ITreeViewArgs extends IItemsControlArgs {
  isSelected?: boolean,
  isExpanded?: boolean,
  hasSelectedNodes?: boolean,
  container?: TreeViewItemModel,
  titleTemplateName?: string,
  headerTemplateName?: string,
  expanderTemplateName?: string,
  multipleSelectionEnable?: boolean
  hasItemsSource?: boolean
  getHeader?: (data: unknown) => unknown
  getItems?: (data: unknown) => Array<unknown>
}

export class TreeView extends ItemsControl<ITreeViewArgs> {
  constructor(
    owner: unknown,
    args: ITreeViewArgs
  ) {
    super(owner, args);

    this.itemTemplateName = 'tree-view/item';
    this.titleTemplateName = 'tree-view/title';
    this.headerTemplateName = 'tree-view/header';
    this.expanderTemplateName = 'tree-view/expander';
  }

  @computed('args.multipleSelectionEnable')
  public get multipleSelectionEnable() {
    return this.args.multipleSelectionEnable ?? false;
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
    return `${this.classNamesBuilder}`;
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

  protected get nodeSelectionChanger()
    : NodeSelectionChanger {
    if (!this._nodeSelectionChanger) {
      this._nodeSelectionChanger = new TreeView.NodeSelectionChanger(this);
    }
    return this._nodeSelectionChanger;
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

  }

  private static NodeSelectionChanger = class {
    constructor(
      public owner: TreeView 
    ) {
      this.isActive = false;
      this.toSelect = [];
      this.toUnselect = [];
    }

    public toSelect: Array<TreeViewItem>
    public toUnselect: Array<TreeViewItem>
    public isActive: boolean;

    public select(node: TreeViewItem) {

      this.toSelect.push(node);
    }

    public unselect(node: TreeViewItem) {

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
}

export function isItemsElement(obj: any)
  : obj is IItemsElement {
  return (
    typeof (<IItemsElement>obj).items !== 'undefined'
  );
}

export function isHeaderElement(obj: any)
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