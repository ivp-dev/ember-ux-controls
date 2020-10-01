// @ts-ignore
import layout from './template';
import bem from "ember-ux-controls/utils/bem";
import SelectItemsControl, { ISelectItemsControlArgs } from "ember-ux-controls/common/classes/select-items-control";
import { notifyPropertyChange } from '@ember/object';
import { ISelectable } from 'ember-ux-controls/common/types';
import { tracked } from '@glimmer/tracking';
import { SplitViewPaneSizeChangedEventArgs } from '../split-view/component';
import ItemCollection, { ItemCollectionChangedEventArgs } from 'ember-ux-controls/common/classes/-private/item-collection';
import { A } from '@ember/array';
import { action } from '@ember/object';

export class DataTableColumnSizesChangedEventArgs extends SplitViewPaneSizeChangedEventArgs {
 
}

export interface IDataTableArgs extends ISelectItemsControlArgs {
  columnTemplateName: string
  cellTemplateName: string;
  headTemplateName: string;
  footTemplateName: string;
  bodyTemplateName: string;
  onColumnSizeChanged: (sizes: number[]) => void
}


export class Column {
  constructor(
    public path: string
  ) { }
}

export class DataTableItemModel implements ISelectable {
  public get item() {
    return this._item;
  }

  public set item(value: object | null) {
    if (this._item !== value) {
      this._item = value;
      notifyPropertyChange(this, 'item');
    }
  }

  public get isSelected() {
    return this._isSelected;
  }

  public set isSelected(
    value: boolean
  ) {
    if (this._isSelected != value) {
      this._isSelected = value;
      notifyPropertyChange(this, 'isSelected');
    }
  }

  private _item: object | null = null
  private _isSelected = false;
}

export class DataTable extends SelectItemsControl<IDataTableArgs> {
  constructor(
    owner: unknown,
    args: IDataTableArgs
  ) {
    super(owner, args);
  }

  @tracked columnSizes?: Array<number>
  @tracked columns = A([])

  public get classNamesBuilder() {
    return bem('data-table');
  }

  public get itemTemplateName() {
    return super.itemTemplateName ?? 'data-table/row';
  }

  public get classNames() {
    return `${this.classNamesBuilder}`;
  }

  public get cellTemplateName(): string {
    return this.args.cellTemplateName ?? 'data-table/cell'
  }

  public get columnTemplateName(): string {
    return this.args.columnTemplateName ?? 'data-table/column'
  }

  public get headTemplateName(): string {
    return this.args.headTemplateName ?? 'data-table/head';
  }

  public get footTemplateName(): string {
    return this.args.footTemplateName ?? 'data-table/foot';
  }

  public get bodyTemplateName(): string {
    return this.args.bodyTemplateName ?? 'data-table/body';
  }

  public createContainerForItem(): DataTableItemModel {
    return new DataTableItemModel();
  }

  public prepareItemContainer(_container: DataTableItemModel): void {

  }

  public clearContainerForItem(container: DataTableItemModel, item: object): void {
    container.item = null;
  }

  public linkContainerToItem(container: DataTableItemModel, item: object): void {
    container.item = item;
  }

  public readItemFromContainer(container: DataTableItemModel): object | null {
    return container.item;
  }

  @action
  public onColumnsChanged(columns: ItemCollection, args: ItemCollectionChangedEventArgs<unknown>) {
    this.columns.replace(args.offset, args.oldItems?.length ?? 0, args.newItems?.map(value => new Column(value.path)))
  }

  public onColumnSizeChanged(sizes: number[]) {
    this.eventHandler.emitEvent(this, DataTableColumnSizesChangedEventArgs, sizes);
  }
}

export default DataTable.RegisterTemplate(layout);