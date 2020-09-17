import Panel, { IPanelArgs } from 'ember-ux-controls/common/classes/panel';
import { Axes } from 'ember-ux-controls/common/types';
import { ClassNamesBuilder } from 'ember-ux-controls/utils/bem';
import MutableArray from '@ember/array/mutable';
import { Column } from 'ember-ux-controls/components/data-table/component';
import { reads } from '@ember/object/computed';

// @ts-ignore
import layout from './template';



interface IDataTableBodyArgs extends IPanelArgs {
  scrollable?: boolean
  scrollAxis?: Axes
  columns?: MutableArray<Column>
  columnSizes: Array<number>
  hasItemsSource?: boolean
  itemTemplateName?: string
  cellTemplateName?: string
  classNamesBuilder?: ClassNamesBuilder
}

export class DataTableBody extends Panel<IDataTableBodyArgs> {
  constructor(
    owner: any,
    args: IDataTableBodyArgs
  ) {
    super(owner, args);
  }

  @reads('args.itemTemplateName') 
  itemTemplateName?: string 

  @reads('args.cellTemplateName') 
  cellTemplateName?: string 

  @reads('args.scrollable') 
  scrollable?: boolean 

  @reads('args.columnSizes') 
  columnSizes?: Array<number> 

  @reads('args.hasItemsSource') 
  hasItemsSource?: boolean 

  @reads('args.scrollAxis') 
  scrollAxis?: Axes 

  @reads('args.columns') 
  columns?: MutableArray<Column> 

  @reads('args.classNamesBuilder') 
  classNamesBuilder?: ClassNamesBuilder

  public get classNames()
    : string {
    if (this.classNamesBuilder) {
      return `${this.classNamesBuilder('body')}`;
    }
    return '';
  }
}

export default DataTableBody.RegisterTemplate(layout);
