// @ts-ignore
import layout from './template';
import { SplitViewPane, ISplitViewPaneArgs } from 'ember-ux-controls/components/split-view/pane/component';
import { IDataTableColumnContainer } from 'ember-ux-controls/components/data-table/head/component';
import { action } from '@ember/object';


export interface IDataTableColumnArgs extends ISplitViewPaneArgs {
  path?: string
}

export class DataTableColumn extends SplitViewPane<IDataTableColumnArgs> implements IDataTableColumnContainer {
  public get path() {
    if (!this.args.path) {
      throw 'Path should be set';
    }

    return this.args.path;
  }
}

export default DataTableColumn.RegisterTemplate(layout);