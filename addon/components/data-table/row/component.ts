import UXElement, { IUXElementArgs } from 'ember-ux-controls/common/classes/ux-element';
import { ClassNamesBuilder } from 'ember-ux-controls/utils/bem';
import { computed } from '@ember/object';

// @ts-ignore
import layout from './template';


interface IDataTableRowArgs extends IUXElementArgs {
  content?: unknown
  classNamesBuilder?: ClassNamesBuilder
}

class DataTableRow extends UXElement<IDataTableRowArgs> {
  @computed('args.{content}')
  public get content() {
    return this.args.content;
  }

  @computed('args.{classNamesBuilder}')
  public get classNamesBuilder() {
    return this.args.classNamesBuilder;
  }

  public get classNames() {
    if (this.classNamesBuilder) {
      return `${this.classNamesBuilder('content')}`
    }
    return '';
  }
}

export default DataTableRow.RegisterTemplate(layout);