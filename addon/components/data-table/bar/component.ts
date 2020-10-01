
// @ts-ignore
import layout from './template';
import bem, { ClassNamesBuilder } from 'ember-ux-controls/utils/bem';
import { SplitViewBar, ISplitViewBarArgs } from 'ember-ux-controls/components/split-view/bar/component'
import { Axes } from 'ember-ux-controls/common/types';

export interface IDataTableBarArgs extends ISplitViewBarArgs {
  axis?: Axes
  barSize?: number
  classNamesBuilder?: ClassNamesBuilder
}

export class DataTableBar extends SplitViewBar<ISplitViewBarArgs> {
  public get classNamesBuilder() {
    return bem('data-table');
  }

  public get classNames() {
    return [
      `${super.classNamesBuilder('bar')}`,
      `${this.classNamesBuilder('bar', {[`$${this.axis}`]: true})}`
    ].join(' ');
  }
}

export default DataTableBar.RegisterTemplate(layout);