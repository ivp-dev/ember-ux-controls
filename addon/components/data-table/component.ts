// @ts-ignore
import layout from './template';
import SelectItemsControl, { ISelectItemsControlArgs } from "ember-ux-controls/common/classes/select-items-control";
import { notifyPropertyChange } from '@ember/object';
import { ISelectable } from 'ember-ux-controls/common/types';
import { SplitViewPaneSizeChangedEventArgs } from 'ember-ux-controls/components/split-view/component';
import { A } from '@ember/array';
import { IDataTableColumnContainer } from 'ember-ux-controls/components/data-table/head/component';
import MutableArray from '@ember/array/mutable';

export class DataTableColumnSizesChangedEventArgs extends SplitViewPaneSizeChangedEventArgs { }

export interface IDataTableArgs extends ISelectItemsControlArgs {
  columnTemplateName: string
  cellTemplateName: string;
  headTemplateName: string;
  footTemplateName: string;
  bodyTemplateName: string;
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

  public get columnSizes() : MutableArray<number> {
    if(!this._columnSizes) {
      this._columnSizes = A();
    }

    return this._columnSizes;
  }

  public get columns(): MutableArray<IDataTableColumnContainer> {
    if(!this._columns) {
      this._columns = A();
    }

    return this._columns;
  }

  public get itemTemplateName() {
    return super.itemTemplateName ?? 'data-table/row';
  }

  public get cellTemplateName()
    : string {
    return this.args.cellTemplateName ?? 'data-table/cell'
  }

  public get columnTemplateName()
    : string {
    return this.args.columnTemplateName ?? 'data-table/column'
  }

  public get headTemplateName()
    : string {
    return this.args.headTemplateName ?? 'data-table/head';
  }

  public get footTemplateName()
    : string {
    return this.args.footTemplateName ?? 'data-table/foot';
  }

  public get bodyTemplateName()
    : string {
    return this.args.bodyTemplateName ?? 'data-table/body';
  }

  public createContainerForItem()
    : DataTableItemModel {
    return new DataTableItemModel();
  }

  public prepareItemContainer(
    //@ts-ignore
    container: DataTableItemModel
  ): void {

  }

  public clearContainerForItem(
    container: DataTableItemModel,
    //@ts-ignore
    item: object
  ): void {
    container.item = null;
  }

  public linkContainerToItem(
    container: DataTableItemModel,
    item: object
  ): void {
    container.item = item;
  }

  public readItemFromContainer(
    container: DataTableItemModel
  ): object | null {
    return container.item;
  }

  private _columns?: MutableArray<IDataTableColumnContainer>
  private _columnSizes?: MutableArray<number>
}

export default DataTable.RegisterTemplate(layout);