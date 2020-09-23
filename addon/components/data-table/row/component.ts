import UXElement, { IUXElementArgs } from 'ember-ux-controls/common/classes/ux-element';
import { ClassNamesBuilder } from 'ember-ux-controls/utils/bem';
import { Column, DataTable, DataTableItemModel } from '../component';
import MutableArray from '@ember/array/mutable';
import { reads } from '@ember/object/computed';
import { action } from '@ember/object';
import on from 'ember-ux-controls/utils/dom/on';
import { computed } from '@ember/object';
// @ts-ignore
import layout from './template';
import off from 'dummy/utils/dom/off';
import Component from '@glimmer/component';


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
  @reads('args.cellTemplateName')
  cellTemplateName?: string

  @reads('args.columns')
  columns?: MutableArray<Column>

  @reads('args.columnSizes')
  columnSizes?: Array<number>

  @reads('args.container')
  container?: DataTableItemModel

  @reads('args.classNamesBuilder')
  classNamesBuilder?: ClassNamesBuilder

  @reads('container.isSelected')
  isSelected?: boolean

  @computed('isSelected')
  public get classNames() {
    if (this.classNamesBuilder) {
      return `${this.classNamesBuilder('row', {
        [`$selected`]: this.isSelected,
      })}`
    }
    return '';
  }

  //@computed('args.{columns.[]}', 'args.{columnSizes.[]}')
  public get cells() {
    let
      item: object | null,
      container: DataTableItemModel | undefined,
      columns: MutableArray<Column> | undefined;

    columns = this.columns;
    container = this.container;

    if (!columns || !container) {
      throw 'Columns and container should be initialized';
    }

    item = container.item;

    if (!item) {
      return [];
    }

    return columns.map((column) => Reflect.get(item as object, column.path));
  }

  @action
  public didInsert(element: Element) {
    on(element, 'click', this.onClickEventHandler);

    this._html = element;
  }

  public willDestroy() {
    let
      element: Element | null
      
    element = this._html;

    if (!element) {
      return;
    }

    off(element, 'click', this.onClickEventHandler);

    super.willDestroy();
  }

  @action
  private onClickEventHandler() {
    let 
      table: Component | null;
      
    table = this.logicalParent;

    if (table instanceof DataTable) {
      if (this.isSelected === true) {
        table.onUnselect(this.container);
      } else if(this.isSelected === false) {
        table.onSelect(this.container);
      }
    }
  }



  private _html: Element | null = null;
}

export default DataTableRow.RegisterTemplate(layout);