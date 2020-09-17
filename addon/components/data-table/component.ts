import bem from "ember-ux-controls/utils/bem";
import SelectItemsControl, { ISelectItemsControlArgs } from "ember-ux-controls/common/classes/select-items-control";
import { notifyPropertyChange } from '@ember/object';
import { ISelectable } from 'ember-ux-controls/common/types';
import MutableArray from '@ember/array/mutable';
import { A } from '@ember/array';
import { tracked } from '@glimmer/tracking';

// @ts-ignore
import layout from './template';


export interface IDataTableArgs extends ISelectItemsControlArgs {
  columnTemplateName: string
  cellTemplateName: string;
  headTemplateName: string;
  footTemplateName: string;
  bodyTemplateName: string;
}


export class Column {
  constructor(
    public path: string
  ) {}
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

  public get columns() {
    if(!this._columns) {
      this._columns = A()
    }

    return this._columns;
  }

  public addColumn(column: Column) {
    this.columns.pushObject(column);
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

  public onColumnSizeChangedInternal(sizes: Array<number>) {
    this.columnSizes = sizes;
  }

  private _columns: MutableArray<Column> | null = null
}

export default DataTable.RegisterTemplate(layout);