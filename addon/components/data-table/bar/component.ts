
// @ts-ignore
import layout from './template';
import { SplitViewBar, ISplitViewBarArgs } from 'ember-ux-controls/components/split-view/bar/component'

export interface IDataTableBarArgs extends ISplitViewBarArgs { }

export class DataTableBar extends SplitViewBar<ISplitViewBarArgs> { 
  
}

export default DataTableBar.RegisterTemplate(layout);