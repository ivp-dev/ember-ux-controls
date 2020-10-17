// @ts-ignore
import layout from './template';
import Panel, { IPanelArgs } from 'ember-ux-controls/common/classes/panel';
import { Axes } from 'ember-ux-controls/common/types';
import MutableArray from '@ember/array/mutable';
import { IDataTableColumnContainer } from 'ember-ux-controls/components/data-table/head/component';
import { reads } from '@ember/object/computed';

interface IDataTableBodyArgs extends IPanelArgs {
  scrollable?: boolean
  scrollAxis?: Axes
  columns?: MutableArray<IDataTableColumnContainer>
  columnSizes: Array<number>
  hasItemsSource?: boolean
  itemTemplateName?: string
  cellTemplateName?: string
}

export class DataTableHeadPanel extends Panel<IDataTableBodyArgs> {
  constructor(
    owner: any,
    args: IDataTableBodyArgs
  ) {
    super(owner, args);
  }

  @reads('args.barSize')
  public barSize?: number

  @reads('args.axis')
  public axis?: Axes

  @reads('args.itemTemplateName') 
  itemTemplateName?: string 

  @reads('args.cellTemplateName') 
  cellTemplateName?: string 

  @reads('args.columnSizes') 
  columnSizes?: Array<number> 

  @reads('args.hasItemsSource') 
  hasItemsSource?: boolean 

  @reads('args.columns') 
  columns?: MutableArray<IDataTableColumnContainer> 
}

export default DataTableHeadPanel.RegisterTemplate(layout);
