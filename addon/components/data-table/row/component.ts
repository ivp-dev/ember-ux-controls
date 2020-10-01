// @ts-ignore
import layout from './template';
import UXElement, { IUXElementArgs } from 'ember-ux-controls/common/classes/ux-element';
import { ClassNamesBuilder } from 'ember-ux-controls/utils/bem';
import { DataTable, DataTableItemModel } from '../component';
import MutableArray from '@ember/array/mutable';
import { reads } from '@ember/object/computed';
import { action } from '@ember/object';
import on from 'ember-ux-controls/utils/dom/on';
import { computed } from '@ember/object';
import off from 'ember-ux-controls/utils/dom/off';
import { IDataTableColumnContainer } from '../head/component';

interface IDataTableRowArgs extends IUXElementArgs {
  columnSizes?: MutableArray<number>,
  columns?: MutableArray<IDataTableColumnContainer>
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
  columns?: MutableArray<IDataTableColumnContainer>

  @reads('args.columnSizes')
  columnSizes?: MutableArray<number>

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
      columns: MutableArray<IDataTableColumnContainer> | undefined;

    columns = this.columns;
    container = this.container;

    if (!columns || !container) {
      return;
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
    if (this.logicalParent instanceof DataTable) {
      if (this.isSelected === true) {
        this.logicalParent.onUnselect(this.container);
      } else if(this.isSelected === false) {
        this.logicalParent.onSelect(this.container);
      }
    }
  }

  private _html: Element | null = null;
}

export default DataTableRow.RegisterTemplate(layout);