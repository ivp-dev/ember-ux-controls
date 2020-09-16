import UXElement, { IUXElementArgs } from 'ember-ux-controls/common/classes/ux-element';
import { ClassNamesBuilder } from 'ember-ux-controls/utils/bem';
import { computed } from '@ember/object';
import { Column, DataTableItemModel } from '../component';
import MutableArray from '@ember/array/mutable';

// @ts-ignore
import layout from './template';

interface IDataTableRowArgs extends IUXElementArgs {
  columnSizes: Array<number>,
  columns?: MutableArray<Column>
  container?: DataTableItemModel
  cellTemplateName?: string
  classNamesBuilder?: ClassNamesBuilder
}

export class CellModel {
  constructor(
    public value: any,
    public width: number
  ) { }
}

class DataTableRow extends UXElement<IDataTableRowArgs> {
  public get classNamesBuilder() {
    return this.args.classNamesBuilder;
  }

  public get classNames() {
    if (this.classNamesBuilder) {
      return `${this.classNamesBuilder('row')}`
    }
    return '';
  }

  public get cellTemplateName() {
    return this.args.cellTemplateName;
  }

  //@computed('args.{columns.[]}', 'args.{columnSizes.[]}')
  public get cells() {
    let
      item: object | null,
      container: DataTableItemModel | undefined,
      columns: MutableArray<Column> | undefined;

    columns = this.args.columns;
    container = this.args.container;

    if (!columns || !container) {
      throw 'Columns and container should be initialized';
    }

    item = container.item;

    if (!item) {
      return [];
    }

    return columns.map((column, index) => new CellModel(
      Reflect.get(item as object, column.path),
      this.args.columnSizes[index]
    ))
  }
}

export default DataTableRow.RegisterTemplate(layout);