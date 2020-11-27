// @ts-ignore
import layout from './template';
import { SplitViewPane, ISplitViewPaneArgs } from 'ember-ux-controls/components/split-view/pane/component';
import { IDataTableColumnContainer } from 'ember-ux-controls/components/data-table/head/component';
import { reads } from '@ember/object/computed';

export interface IDataTableColumnArgs extends ISplitViewPaneArgs {
  path?: string
  groupBy: boolean
}

export class DataTableColumn extends SplitViewPane<IDataTableColumnArgs> implements IDataTableColumnContainer {
  @reads('args.path')
  public path?: string

  @reads('args.groupBy')
  public groupBy?: boolean
}

export default DataTableColumn.RegisterTemplate(layout);