import UXElement, { IUXElementArgs } from 'ember-ux-controls/common/classes/ux-element';
import { ClassNamesBuilder } from 'ember-ux-controls/utils/bem';
import { action } from '@ember/object';
// @ts-ignore
import layout from './template';


interface IDataTableHeadArgs extends IUXElementArgs {
  columnTemplateName?: string
  classNamesBuilder?: ClassNamesBuilder
}

class DataTableHead extends UXElement<IDataTableHeadArgs> {
  
  public get columnTemplateName() {
    return this.args.columnTemplateName;
  }

  public get classNamesBuilder() {
    return this.args.classNamesBuilder;
  }

  public get classNames() {
    if (this.classNamesBuilder) {
      return `${this.classNamesBuilder('head')}`
    }
    return '';
  }

  @action
  public onColumnsSizeChanged(sizes: Array<number>) {
    console.log(sizes)
  }

}

export default DataTableHead.RegisterTemplate(layout);