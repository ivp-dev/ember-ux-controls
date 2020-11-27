// @ts-ignore
import layout from './template';
import { SplitView, ISplitViewArgs, SplitViewPaneModel, ISplitViewContainer } from 'ember-ux-controls/components/split-view/component';
import ItemCollection, { ItemCollectionChangedEventArgs } from 'ember-ux-controls/common/classes/-private/item-collection';
import { DataTableColumn } from 'ember-ux-controls/components/data-table/column/component';
import { notifyPropertyChange } from '@ember/object';
import { BaseEventArgs } from 'ember-ux-controls/common/classes/event-args';
import MutableArray from '@ember/array/mutable';
import { reads } from '@ember/object/computed';
export class DataTableColumnsChangedEventArgs extends BaseEventArgs {
  constructor(
    public offset: number,
    public oldColumns: Array<IDataTableColumnContainer>,
    public newColumns: Array<IDataTableColumnContainer>
  ) {
    super();
  }
}

export interface IHasPath {
  path: string
  groupBy: boolean
}

export interface IDataTableColumnContainer extends Partial<IHasPath>, ISplitViewContainer {
  
}

export interface IDataTableHeadArgs extends ISplitViewArgs {
  columnSizes?: MutableArray<number>
  onColumnsChanged?: (columns: ItemCollection) => void
  onColumnSizeChangedInternal: (sizes: Array<number>) => void
}

export class DataTableColumnModel extends SplitViewPaneModel implements IDataTableColumnContainer {

  public get path() {
    return this._path;
  }

  public set path(
    value: string | undefined
  ) {
    if (this._path !== value) {
      this._path = value;
      notifyPropertyChange(this, 'path');
    }
  }

  public get groupBy() {
    return this._groupBy ?? false;
  }

  public set groupBy(
    value: boolean
  ) {
    if (this._groupBy !== value) {
      this._groupBy = value;
      notifyPropertyChange(this, 'groupBy');
    }
  }

  private _groupBy? : boolean
  private _path?: string
}

export class DataTableHead<T extends IDataTableHeadArgs> extends SplitView<T> {
  @reads('args.columnSizes')
  private columnSizes?: MutableArray<number>

  @reads('args.columns')
  private columns?: MutableArray<unknown>

  public onSizeChanged(sizes: number[]) {
    super.onSizeChanged(sizes);

    if (this.columnSizes) {
      this.columnSizes.replace(0, sizes.length, sizes);
    }
  }

  public onItemCollectionChanged(
    sender: ItemCollection,
    args: ItemCollectionChangedEventArgs
  ) {
    let
      offset: number,
      count: number,
      newItems: Array<unknown>;

    super.onItemCollectionChanged(sender, args);

    offset = args.offset;
    count = args.oldItems.length;
    newItems = args.newItems;

    if (this.columns) {
      this.columns.replace(
        offset, count, newItems
      );
    }
  }

  public itemItsOwnContainer(
    item: IDataTableColumnContainer
  ): item is DataTableColumn {
    return item instanceof DataTableColumn;
  }

  public createContainerForItem()
    : IDataTableColumnContainer {
    return new DataTableColumnModel();
  }

  public prepareItemContainer(
    container: IDataTableColumnContainer
  ): void {
    let
      item: IDataTableColumnContainer;

    item = this.readItemFromContainer(container);

    if (hasPath(item)) {
      container.path = item.path;
      container.groupBy = item.groupBy
    } else {
      throw 'Can`t extract path'
    }
  }

  public clearContainerForItem(
    container: IDataTableColumnContainer
  ): void {
    container.item = null;
    container.content = null;
  }

  public linkContainerToItem(
    container: IDataTableColumnContainer,
    item: IDataTableColumnContainer
  ): void {
    container.item = item;
  }

  public readItemFromContainer(
    container: IDataTableColumnContainer
  ): IDataTableColumnContainer {
    return container.item as IDataTableColumnContainer;
  }
}

function hasPath(obj: unknown): obj is IHasPath {
  return typeof (<IHasPath>obj).path !== 'undefined';
}

export default DataTableHead.RegisterTemplate(layout);