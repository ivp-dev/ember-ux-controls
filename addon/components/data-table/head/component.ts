import UXElement, { IUXElementArgs } from 'ember-ux-controls/common/classes/ux-element';
import { ClassNamesBuilder } from 'ember-ux-controls/utils/bem';
import { computed } from '@ember/object';

// @ts-ignore
import layout from './template';


interface IDataTableHeadArgs extends IUXElementArgs {
  content?: unknown
  classNamesBuilder?: ClassNamesBuilder
}

class DataTableHead extends UXElement<IDataTableHeadArgs> {
  @computed('args.{classNamesBuilder}')
  public get classNamesBuilder() {
    return this.args.classNamesBuilder;
  }

  public get classNames() {
    if (this.classNamesBuilder) {
      return `${this.classNamesBuilder('head')}`
    }
    return '';
  }
}

export default DataTableHead.RegisterTemplate(layout);