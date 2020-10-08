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
  onSelect: (container: unknown) => void
  onUnselect: (container: unknown) => void
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
  columns?: MutableArray<IDataTableColumnContainer> 

  @reads('args.onSelect') 
  onSelect?: (container: unknown) => void 

  @reads('args.onUnselect') 
  onUnselect?: (container: unknown) => void 
}

export default DataTableBody.RegisterTemplate(layout);
