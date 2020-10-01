// @ts-ignore
import layout from './template';
import UXElement, { IUXElementArgs } from 'ember-ux-controls/common/classes/ux-element';
import { ClassNamesBuilder } from 'ember-ux-controls/utils/bem';
import { htmlSafe } from '@ember/template';
import { reads } from '@ember/object/computed';
import { computed } from '@ember/object';

interface IDataTableCellArgs extends IUXElementArgs {
  width: number
  classNamesBuilder?: ClassNamesBuilder
}

class DataTableCell extends UXElement<IDataTableCellArgs> {
  @reads('args.classNamesBuilder')
  classNamesBuilder?: ClassNamesBuilder

  @reads('args.width')
  width?: number

  @computed('width')
  public get style() {
    return htmlSafe(
      `width: ${this.width}%`
    );
  }

  public get classNames() {
    if (this.classNamesBuilder) {
      return `${this.classNamesBuilder('cell')}`
    }
    return '';
  }
}

export default DataTableCell.RegisterTemplate(layout);