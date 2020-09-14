import UXElement, { IUXElementArgs } from 'ember-ux-controls/common/classes/ux-element';
import { ClassNamesBuilder } from 'ember-ux-controls/utils/bem';
import { computed } from '@ember/object';

// @ts-ignore
import layout from './template';


interface IDataTableFootArgs extends IUXElementArgs {
  classNamesBuilder?: ClassNamesBuilder
}

class DataTableFoot extends UXElement<IDataTableFootArgs> {
  @computed('args.{classNamesBuilder}')
  public get classNamesBuilder() {
    return this.args.classNamesBuilder;
  }

  public get classNames() {
    if (this.classNamesBuilder) {
      return `${this.classNamesBuilder('foot')}`
    }
    return '';
  }
}

export default DataTableFoot.RegisterTemplate(layout);