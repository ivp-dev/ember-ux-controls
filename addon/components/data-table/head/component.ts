// @ts-ignore
import layout from './template';
import { ClassNamesBuilder } from 'ember-ux-controls/utils/bem';
import { SplitView, ISplitViewArgs, PaneModel } from 'ember-ux-controls/components/split-view/component';
import { DataTable } from 'ember-ux-controls/components/data-table/component';
import ItemCollection, { ItemCollectionChangedEventArgs } from 'ember-ux-controls/common/classes/-private/item-collection';
import { DataTableColumn } from 'ember-ux-controls/components/data-table/column/component';

export interface IDataTableHeadArgs extends ISplitViewArgs {
  classNamesBuilder?: ClassNamesBuilder
  onColumnsChanged?: (columns: ItemCollection) => void
}

export class ColumnModel extends PaneModel{

}

export class DataTableHead<T extends IDataTableHeadArgs> extends SplitView<T> {
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
  }

  public itemItsOwnContainer(
    item: unknown
  ): item is DataTableColumn {
    let
      result: boolean

    result = item instanceof DataTableColumn;

    return result;
  }

  public createContainerForItem()
    : ColumnModel {
    return new ColumnModel();
  }

  public prepareItemContainer(
    _container: ColumnModel
  ): void {
    
  }

  public clearContainerForItem(
    container: PaneModel
  ): void {
    container.item = null;
    container.content = null;
  }

  public linkContainerToItem(
    container: PaneModel,
    item: unknown
  ): void {
    container.item = item;
  }

  public readItemFromContainer(
    container: PaneModel
  ): unknown {
    return container.item;
  }

  protected onItemCollectionChanged(
    sender: ItemCollection,
    args: ItemCollectionChangedEventArgs<unknown>
  ) {
    if(typeof this.args.onColumnsChanged === 'function') {
      this.args.onColumnsChanged(sender, args);
    }
    super.onItemCollectionChanged(sender, args)
  }
}

export default DataTableHead.RegisterTemplate(layout);