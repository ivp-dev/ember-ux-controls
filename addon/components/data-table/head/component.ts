// @ts-ignore
import layout from './template';
import { ClassNamesBuilder } from 'ember-ux-controls/utils/bem';
import { SplitView, ISplitViewArgs, SplitViewPaneModel, ISplitViewContainer } from 'ember-ux-controls/components/split-view/component';
import { DataTable } from 'ember-ux-controls/components/data-table/component';
import ItemCollection, { ItemCollectionChangedEventArgs } from 'ember-ux-controls/common/classes/-private/item-collection';
import { DataTableColumn } from 'ember-ux-controls/components/data-table/column/component';
import { notifyPropertyChange } from '@ember/object';
import { BaseEventArgs } from 'ember-ux-controls/common/classes/event-args';

export class DataTableColumnsChangedEventArgs extends BaseEventArgs {
  constructor(
    public offset: number,
    public oldColumns: Array<IDataTableColumnContainer>,
    public newColumns: Array<IDataTableColumnContainer>
  ) {
    super();
  }
}

export interface IDataTableColumnContainer extends ISplitViewContainer {
  path: string
}

export interface IDataTableHeadArgs extends ISplitViewArgs {
  classNamesBuilder?: ClassNamesBuilder
  onColumnsChanged?: (columns: ItemCollection) => void
}

export class DataTableColumnModel extends SplitViewPaneModel implements IDataTableColumnContainer {
  public get path() {
    return this._path;
  }

  public set path(value: string) {
    if (this._path !== value) {
      this._path = value;
      notifyPropertyChange(this, 'path');
    }
  }

  private _path!: string
}

export class DataTableHead<T extends IDataTableHeadArgs = {}> extends SplitView<T> {
  public get classNamesBuilder() {
    if (!this.args.classNamesBuilder) {
      throw 'ClassNamesBuilder should be set';
    }
    return this.args.classNamesBuilder;
  }

  public get classNames() {
    return [
      `${super.classNamesBuilder}`,
      `${this.classNamesBuilder('head')}`
    ].join(' ')
  }

  public onSizesChanged(sizes: number[]) {
    if (this.logicalParent instanceof DataTable) {
      this.logicalParent.onColumnSizeChanged(sizes);
    }

    super.onSizesChanged(sizes);
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

  protected onItemCollectionChanged(
    sender: ItemCollection,
    args: ItemCollectionChangedEventArgs
  ) {
    super.onItemCollectionChanged(sender, args);

    if (this.logicalParent instanceof DataTable) {
      this.logicalParent.onColumnsChanged(
        args.offset,
        args.newItems as IDataTableColumnContainer[],
        args.oldItems as IDataTableColumnContainer[]
      );
    }
  }
}

function hasPath(obj: unknown): obj is IHasPath {
  return typeof (<IHasPath>obj).path !== 'undefined';
}

interface IHasPath {
  path: string
}

export default DataTableHead.RegisterTemplate(layout);