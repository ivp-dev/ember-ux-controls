import UXElement, { IUXElementArgs } from 'ember-ux-core/components/ux-element'
import bem, { ClassNamesBuilder } from 'ember-ux-core/utils/bem';
import { IHeaderedElement, IItemsElement } from 'ember-ux-controls/common/types';
import { notifyPropertyChange } from '@ember/object';
import { computed } from '@ember/object';
import { TreeViewItem } from 'ember-ux-controls/components/tree-view/item/component';
import NativeArray from "@ember/array/-private/native-array";
import { reads } from '@ember/object/computed';
import { isArray } from '@ember/array';
import { A } from '@ember/array';
// @ts-ignore
import layout from './template';

export interface ITreeViewArgs extends IUXElementArgs {
  itemsSource?: NativeArray<unknown>;
  itemTemplateName?: string
  titleTemplateName?: string,
  headerTemplateName?: string,
  expanderTemplateName?: string,
  multipleSelectionEnable?: boolean,
  getHeader?: (data: unknown) => unknown
  getItems?: (data: unknown) => Array<unknown>
}

export class TreeView extends UXElement<ITreeViewArgs> {
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

  @computed('selectedNodes.[]')
  public get selectedPath() {
    return this.selectedNodes.map(node => node.header).join('/');
  }

  @reads('args.itemsSource')
  itemsSource: NativeArray<unknown> | null = null

  public get selectedNodes() {
    if (!this._selectedNodes) {
      this._selectedNodes = A();
    }

    return this._selectedNodes;
  }

  public get multipleSelectionEnable() {
    return this.args.multipleSelectionEnable ?? false;
  }

  public get classNamesBuilder()
    : ClassNamesBuilder {
    return bem('tree-view');
  }

  public get hasItemsSource() {
    return isArray(this.itemsSource);
  }

  @computed('args.itemTemplateName')
  public get itemTemplateName() {
    return (
      this.args.itemTemplateName ??
      this._itemTemplateName
    );
  }

  public set itemTemplateName(
    value: string | null
  ) {
    if (this._itemTemplateName !== value) {
      this._itemTemplateName = value;
      notifyPropertyChange(this, 'itemTemplateName')
    }
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

  public get nodeSelectionChanger()
    : NodeSelectionChanger {
    if (!this._nodeSelectionChanger) {
      this._nodeSelectionChanger = new TreeView.NodeSelectionChanger(this);
    }
    return this._nodeSelectionChanger;
  }

  public willDestroy() {
    if (this.isDestroyed) {
      return;
    }
  }

  public onSelect(node: TreeViewItem) {
    try {
      if (this.nodeSelectionChanger.isActive === false) {
        this.nodeSelectionChanger.begin();
      }
      this.nodeSelectionChanger.select(node);
      node.updateContainsSelection();
    } finally {
      if (this.nodeSelectionChanger.isActive) {
        this.nodeSelectionChanger.end();
      }
    }
  }

  public onUnselect(
    node: TreeViewItem
  ) {
    try {
      if (this.nodeSelectionChanger.isActive === false) {
        this.nodeSelectionChanger.begin();
      }
      this.nodeSelectionChanger.unselect(node);
      node.updateContainsSelection();
    } finally {
      this.nodeSelectionChanger.end();
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
      if (
        this.toSelect.some(selected =>
          selected === node
        )
      ) {
        this.toUnselect.push(node);
        return;
      }

      this.toSelect.push(node);
    }

    public unselect(node: TreeViewItem) {
      if (
        this.toUnselect.some(unselected =>
          unselected === node
        )
      ) {
        this.toSelect.push(node);
        return;
      }

      this.toUnselect.push(node);
    }

    public begin() {
      this.cleanup();
      this.isActive = true;
    }

    public end() {
      let
        selected: Array<unknown>,
        unselected: Array<unknown>

      selected = [];
      unselected = [];

      try {
        this.applyCanSelectMultiple();
        this.createDelta(
          selected,
          unselected
        );
      } finally {
        this.isActive = false;
        this.cleanup();
      }
    }

    public cleanup() {
      this.toSelect.length = 0;
      this.toUnselect.length = 0;
    }

    public applyCanSelectMultiple() {
      let
        count: number;

      if (this.owner.multipleSelectionEnable) {
        return;
      }

      if (this.toSelect.length === 1) {
        if (this.owner.selectedNodes.length > 0) {
          this.toUnselect.length = 0;
          this.toUnselect.push(...this.owner.selectedNodes);
        }
        return;
      }

      count = this.owner.selectedNodes.length;
      // if multipleSelectionEnable changed from true to false
      if (count > 1 && count != this.toUnselect.length + 1) {
        this.toUnselect.length = 0;
        // unselect all but the first
        this.toUnselect.push(
          ...this.owner.selectedNodes.without(
            this.owner.selectedNodes[0]
          )
        );
      }
    }

    public createDelta(
      selected: Array<unknown>,
      unselected: Array<unknown>
    ) {
      let
        idx: number,
        node: TreeViewItem;

      for (
        idx = 0;
        idx < this.toUnselect.length;
        idx++
      ) {
        node = this.toUnselect[idx];
        // if toSelect contains node with the same parent as unselected
        // we no need to unselect it by parent because the parent
        // will take care of it 

        // if (!this.toSelect.some(toSelectNode =>
        //   toSelectNode.parentNode === node.parentNode
        // )) {
        //  node.updateParentSelection(false);
        // }
        node.updateParentSelection(false);
        this.owner.selectedNodes.removeObject(node);
        unselected.push(node);
      }

      for (
        idx = 0;
        idx < this.toSelect.length;
        idx++
      ) {
        node = this.toSelect[idx];
        node.updateParentSelection(true);
        this.owner.selectedNodes.pushObject(node);
        selected.push(node);
      }
    }
  }

  private _selectedNodes: NativeArray<TreeViewItem> | null = null
  private _nodeSelectionChanger: NodeSelectionChanger | null = null
  private _itemTemplateName: string | null = null
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