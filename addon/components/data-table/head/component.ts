import UXElement, { IUXElementArgs } from 'ember-ux-controls/common/classes/ux-element';
import { ClassNamesBuilder } from 'ember-ux-controls/utils/bem';
import { action } from '@ember/object';

// @ts-ignore
import layout from './template';
import { DataTable } from '../component';


interface IDataTableHeadArgs extends IUXElementArgs {
  columnTemplateName?: string
  classNamesBuilder?: ClassNamesBuilder
  onSizeChanged?: (sizes: Array<number>) => void
  onSizeChangedInternal: (sizes: Array<number>) => void
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
  protected onSizeChangedInternal(sizes: Array<number>) {
    if(this.visualParent instanceof DataTable) {
      this.visualParent.onColumnSizeChangedInternal(sizes);
    }
    
    if(typeof this.args.onSizeChanged === 'function') {
      this.args.onSizeChanged(sizes);
    }
  }
}

export default DataTableHead.RegisterTemplate(layout);