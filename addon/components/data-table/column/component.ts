import UXElement, { IUXElementArgs } from 'ember-ux-controls/common/classes/ux-element';
import { ClassNamesBuilder } from 'ember-ux-controls/utils/bem';
import { action } from '@ember/object';
import { DataTable, Column } from '../component';
import { guidFor } from '@ember/object/internals';

// @ts-ignore
import layout from './template';



interface IDataTableColumnArgs extends IUXElementArgs {
  path?: string
  fixed?: boolean
  addColumn?: (column:Column) => void
  classNamesBuilder?: ClassNamesBuilder
}

class DataTableColumn extends UXElement<IDataTableColumnArgs> {

  public get elementId() {
    return guidFor(this)
  }

  public get classNamesBuilder() {
    return this.args.classNamesBuilder;
  }

  public get classNames() {
    if (this.classNamesBuilder) {
      return `${this.classNamesBuilder('column', { '$fixed': this.args.fixed })}`
    }
    return '';
  }

  

  @action
  didInsert() {
    let
      path: string | undefined;

    path = this.args.path;
    
    if(!path) {
      throw 'Path should be set';
    }

    if(this.logicalParent instanceof DataTable) {
      this.logicalParent.addColumn(
        new Column(path)
      );
    }
  }
}

export default DataTableColumn.RegisterTemplate(layout);