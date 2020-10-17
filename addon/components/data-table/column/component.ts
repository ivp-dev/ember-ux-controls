// @ts-ignore
import layout from './template';
import { SplitViewPane, ISplitViewPaneArgs } from 'ember-ux-controls/components/split-view/pane/component';
import { IDataTableColumnContainer } from 'ember-ux-controls/components/data-table/head/component';
import { notifyPropertyChange } from '@ember/object';

export interface IDataTableColumnArgs extends ISplitViewPaneArgs {
  path?: string
}

export class DataTableColumn extends SplitViewPane<IDataTableColumnArgs> implements IDataTableColumnContainer {
  
  public get path() {
    return this.args.path ?? this._path ?? ''
  }

  public set path(value: string) {
    if(this._path !== value) {
      this._path = value;
      notifyPropertyChange(this, 'path');
    }
  }

  private _path?: string
}

export default DataTableColumn.RegisterTemplate(layout);