// @ts-ignore
import layout from './template';
import { ClassNamesBuilder } from 'ember-ux-controls/utils/bem';
import { action } from '@ember/object';
import { DataTable } from 'ember-ux-controls/components/data-table/component';
import { reads } from '@ember/object/computed';
import { SplitView, ISplitViewArgs } from 'ember-ux-controls/components/split-view/component';

interface IDataTableHeadArgs extends ISplitViewArgs {
  columnTemplateName?: string
  classNamesBuilder?: ClassNamesBuilder
  onSizeChanged?: (sizes: Array<number>) => void
  onSizeChangedInternal: (sizes: Array<number>) => void
}

class DataTableHead extends SplitView<IDataTableHeadArgs> {
  @reads('args.columnTemplateName')
  columnTemplateName?: string

  public get classNamesBuilder() {
    if (!this.args.classNamesBuilder) {
      throw 'ClassNamesBuilder should be set';
    }
    return this.args.classNamesBuilder;
  }

  public get classNames() {
    return [
      `${super.classNamesBuilder}`,
      `${this.classNamesBuilder('head')}`
    ].join(' ')
  }

  @action
  protected onSizeChangedInternal(sizes: Array<number>) {
    if (this.visualParent instanceof DataTable) {
      this.visualParent.onColumnSizeChangedInternal(sizes);
    }

    if (typeof this.args.onSizeChanged === 'function') {
      this.args.onSizeChanged(sizes);
    }
  }
}

export default DataTableHead.RegisterTemplate(layout);