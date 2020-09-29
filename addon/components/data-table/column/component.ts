// @ts-ignore
import layout from './template';
import { ClassNamesBuilder } from 'ember-ux-controls/utils/bem';
import { action } from '@ember/object';
import { DataTable, Column } from '../component';
import { guidFor } from '@ember/object/internals';
import { SplitViewPane, ISplitViewPaneArgs } from 'ember-ux-controls/components/split-view/pane/component';

interface IDataTableColumnArgs extends ISplitViewPaneArgs {
  path?: string
  fixed?: boolean
  addColumn?: (column: Column) => void
  classNamesBuilder?: ClassNamesBuilder
}

class DataTableColumn extends SplitViewPane<IDataTableColumnArgs> {

  public get elementId() {
    return guidFor(this)
  }

  public get classNamesBuilder() {
    return this.args.classNamesBuilder ?? super.classNamesBuilder;
  }

  public get classNames() {
    if (this.classNamesBuilder) {
      return [
        `${super.classNames}`,
        `${this.classNamesBuilder('column', { '$fixed': this.args.fixed })}`
      ].join(' ')
    }
    return '';
  }

  @action
  didInsert() {
    let
      path: string | undefined;

    path = this.args.path;

    if (!path) {
      throw 'Path should be set';
    }

    if (this.logicalParent instanceof DataTable) {
      this.logicalParent.addColumn(
        new Column(path)
      );
    }
  }
}

export default DataTableColumn.RegisterTemplate(layout);