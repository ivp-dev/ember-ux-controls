import bem from "dummy/utils/bem";
import SelectItemsControl, { ISelectItemsControlArgs } from "ember-ux-controls/common/classes/select-items-control";
import { notifyPropertyChange } from '@ember/object';
import { ISelectable } from 'ember-ux-controls/common/types';
// @ts-ignore
import layout from './template';

export interface IDataTableArgs extends ISelectItemsControlArgs {
  cellTemplateName: string;
  headTemplateName: string;
  footTemplateName: string;
  bodyTemplateName: string;
}

export class DataTableItemModel implements ISelectable {
  public get item() {
    return this._item;
  }

  public set item(value: unknown) {
    if (this._item !== value) {
      this._item = value;
      notifyPropertyChange(this, 'item');
    }
  }

  public get content() {
    return this._content;
  }

  public set content(
    value: unknown
  ) {
    if (this._content !== value) {
      this._content = value;
      notifyPropertyChange(this, 'content');
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

  private _content: unknown = null
  private _item: unknown = null
  private _isSelected = false;
}

export class DataTable extends SelectItemsControl<IDataTableArgs> {
  constructor(
    owner: unknown,
    args: IDataTableArgs
  ) {
    super(owner, args);

    this.itemTemplateName = 'data-table/row';
  }

  public get classNamesBuilder() {
    return bem('data-table');
  }

  public get classNames() {
    return `${this.classNamesBuilder}`;
  }

  public get cellTemplateName(): string {
    return this.args.cellTemplateName ?? 'data-table/cell'
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

  public createContainerForItem(item: unknown): unknown {
    return new DataTableItemModel();
  }
  public prepareItemContainer(_container: DataTableItemModel): void {
    
  }
  public clearContainerForItem(container: DataTableItemModel, item: unknown): void {
    container.item = null;
  }
  public linkContainerToItem(container: DataTableItemModel, item: unknown): void {
    container.item = item;
  }
  public readItemFromContainer(container: DataTableItemModel): unknown {
    return container.item;
  }
}

export default DataTable.RegisterTemplate(layout);