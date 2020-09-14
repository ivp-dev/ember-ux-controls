import UXElement, { IUXElementArgs } from 'ember-ux-controls/common/classes/ux-element';
import { ClassNamesBuilder } from 'ember-ux-controls/utils/bem';
import { computed } from '@ember/object';

// @ts-ignore
import layout from './template';


interface IDataTableCellArgs extends IUXElementArgs {
  classNamesBuilder?: ClassNamesBuilder
}

class DataTableCell extends UXElement<IDataTableCellArgs> {
  @computed('args.{classNamesBuilder}')
  public get classNamesBuilder() {
    return this.args.classNamesBuilder;
  }

  public get classNames() {
    if (this.classNamesBuilder) {
      return `${this.classNamesBuilder('cell')}`
    }
    return '';
  }
}

export default DataTableCell.RegisterTemplate(layout);