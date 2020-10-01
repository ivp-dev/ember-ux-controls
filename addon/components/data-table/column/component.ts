// @ts-ignore
import layout from './template';
import { SplitViewPane, ISplitViewPaneArgs } from 'ember-ux-controls/components/split-view/pane/component';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';

export interface IDataTableColumnArgs extends ISplitViewPaneArgs {
  path?: string
}

export class DataTableColumn extends SplitViewPane<IDataTableColumnArgs> {
  
  @reads('args.path')
  public path?: string 

  public get classNamesBuilder() {
    return this.args.classNamesBuilder;
  }

  @computed('isFixed', 'axis')
  public get classNames() {
    if (this.classNamesBuilder) {
      return [
        `${super.classNames}`,
        `${this.classNamesBuilder('column', {
          '$fixed': this.isFixed,
          [`$${this.axis}`]: true
        })}`
      ].join(' ');
    }
    return '';
  }
}

export default DataTableColumn.RegisterTemplate(layout);