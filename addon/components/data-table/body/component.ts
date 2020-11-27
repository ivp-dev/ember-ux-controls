// @ts-ignore
import layout from './template';
import Panel, { IPanelArgs } from 'ember-ux-controls/common/classes/panel';
import { Axes } from 'ember-ux-controls/common/types';
import MutableArray from '@ember/array/mutable';
import { IDataTableColumnContainer } from 'ember-ux-controls/components/data-table/head/component';
import { reads } from '@ember/object/computed';
import { computed } from '@ember/object';

interface IDataTableBodyArgs extends IPanelArgs {
  scrollable?: boolean
  scrollAxis?: Axes
  columns?: MutableArray<IDataTableColumnContainer>
  columnSizes: Array<number>
  hasItemsSource?: boolean
  itemTemplateName?: string
  groupTemplateName?: string
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
  public itemTemplateName?: string 

  @reads('args.groupTemplateName') 
  public groupTemplateName?: string 

  @reads('args.cellTemplateName') 
  public cellTemplateName?: string 

  @reads('args.scrollable') 
  public scrollable?: boolean 

  @reads('args.columnSizes') 
  public columnSizes?: Array<number> 

  @reads('args.hasItemsSource') 
  public hasItemsSource?: boolean 

  @reads('args.scrollAxis') 
  public scrollAxis?: Axes 

  @reads('args.columns') 
  public columns?: MutableArray<IDataTableColumnContainer> 

  @computed('columns.[].groupBy') 
  public get groupBy(){
    var t = this.columns?.filter(column => column.groupBy === true);
    if(t && t.length) {
      return t[0].path
    }
    return void 0;
  }

  @reads('args.onSelect') 
  onSelect?: (container: unknown) => void 

  @reads('args.onUnselect') 
  onUnselect?: (container: unknown) => void 
}

export default DataTableBody.RegisterTemplate(layout);
