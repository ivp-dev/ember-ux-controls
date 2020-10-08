// @ts-ignore
import layout from './template';
import UXElement, { IUXElementArgs } from 'ember-ux-controls/common/classes/ux-element';
import { htmlSafe } from '@ember/template';
import { reads } from '@ember/object/computed';
import { computed } from '@ember/object';

interface IDataTableCellArgs extends IUXElementArgs {
  width: number
}

class DataTableCell extends UXElement<IDataTableCellArgs> {
  @reads('args.width')
  width?: number

  @computed('width')
  public get style() {
    return htmlSafe(
      `width: ${this.width}%`
    );
  }
}

export default DataTableCell.RegisterTemplate(layout);