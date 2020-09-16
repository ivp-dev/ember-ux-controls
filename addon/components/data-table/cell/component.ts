import UXElement, { IUXElementArgs } from 'ember-ux-controls/common/classes/ux-element';
import { ClassNamesBuilder } from 'ember-ux-controls/utils/bem';
import { computed } from '@ember/object';
import { CellModel } from '../row/component';
import { htmlSafe } from '@ember/template';
// @ts-ignore
import layout from './template';


interface IDataTableCellArgs extends IUXElementArgs {
  content: CellModel
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

  public get style() {
    return htmlSafe(`width: ${this.args.content.width}%`);
  }

  public get value() {
    return this.args.content.value;
  }
}

export default DataTableCell.RegisterTemplate(layout);