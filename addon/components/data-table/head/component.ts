// @ts-ignore
import layout from './template';
import { ClassNamesBuilder } from 'ember-ux-controls/utils/bem';
import { reads } from '@ember/object/computed';
import { SplitView, ISplitViewArgs } from 'ember-ux-controls/components/split-view/component';
import { DataTable } from 'ember-ux-controls/components/data-table/component';
import { ItemCollectionChangedEventArgs } from 'ember-ux-controls/common/classes/-private/item-collection';

export interface IDataTableHeadArgs extends ISplitViewArgs {
  columnTemplateName?: string
  classNamesBuilder?: ClassNamesBuilder
}

export class DataTableHead<T extends IDataTableHeadArgs> extends SplitView<T> {
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

  public onSizesChanged(sizes: number[]) {
    if (this.logicalParent instanceof DataTable) {
      this.logicalParent.onColumnSizeChanged(sizes);
    }
  }

  protected onItemCollectionChangedInternal(args: ItemCollectionChangedEventArgs<unknown>) {
    super.onItemCollectionChangedInternal(args)
  }
}

export default DataTableHead.RegisterTemplate(layout);