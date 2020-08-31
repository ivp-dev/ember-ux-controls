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
    if (!this.nodeSelectionChanger.isActive) {
      throw new Error('Selection should be already started');
    }
    this.nodeSelectionChanger.select(node);
  }

  public onUnselect(
    node: TreeViewItem
  ) {
    if (!this.nodeSelectionChanger.isActive) {
      throw new Error('Selection should be already started');
    }
    this.nodeSelectionChanger.unselect(node);
  }

  private static NodeSelectionChanger = class {
    constructor(
      public owner: TreeView
    ) {
      this.isActive = false;
      this.toSelect = A();
      this.toUnselect = A();
    }

    public toSelect: NativeArray<TreeViewItem>
    public toUnselect: NativeArray<TreeViewItem>
    public isActive: boolean;

    public select(node: TreeViewItem) {
      // ignore if already selected
      if(this.owner.selectedNodes.includes(node)) {
        return;
      }

      if (this.toSelect.includes(node)) {
        this.toUnselect.pushObject(node);
      } else {
        this.toSelect.pushObject(node);
      }
    }

    public unselect(node: TreeViewItem) {
      // ignore if not selected
      if(!this.owner.selectedNodes.includes(node)) {
        return;
      }

      if (this.toSelect.includes(node)) {
        this.toSelect.pushObject(node);
      } else {
        this.toUnselect.pushObject(node);
      }
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
      this.toSelect.clear();
      this.toUnselect.clear();
    }

    public createDelta(
      selected: Array<unknown>,
      unselected: Array<unknown>
    ) {
      this.owner.selectedNodes.removeObjects(this.toUnselect);
      unselected.push(this.toUnselect.map(
        tvi => tvi.container.item
      ));

      this.owner.selectedNodes.pushObjects(this.toSelect);
      selected.push(this.toSelect.map(
        tvi => tvi.container.item
      ));
    }

    public applyCanSelectMultiple() {
      let
        count: number;

      if (this.owner.multipleSelectionEnable) {
        return;
      }

      count = this.owner.selectedNodes.length;

      if (this.toSelect.length === 1) {
        if (count > 0) {
          this.owner.selectedNodes.forEach(node => {
            node.changeSelectionInternal(false);
          })
        }
      }

      // if multipleSelectionEnable changed from true to false
      if (count > 1 && count !== this.toUnselect.length + 1) {
        this.owner.selectedNodes.without(
          this.owner.selectedNodes[0]
        ).forEach(node => {
          node.changeSelectionInternal(false);
        });
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
  toSelect: NativeArray<TreeViewItem>
  toUnselect: NativeArray<TreeViewItem>
  begin: () => void
  end: () => void
  select: (node: TreeViewItem) => void
  unselect: (node: TreeViewItem) => void
  cleanup: () => void
}

export default TreeView.RegisterTemplate(layout);