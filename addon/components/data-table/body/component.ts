import Panel, { IPanelArgs } from 'ember-ux-controls/common/classes/panel';
import { Axes } from 'ember-ux-controls/common/types';
import { ClassNamesBuilder } from 'ember-ux-controls/utils/bem';
import { computed } from '@ember/object';
import MutableArray from '@ember/array/mutable';
import { Column } from '../component';

// @ts-ignore
import layout from './template';



interface IDataTableBodyArgs extends IPanelArgs {
  scrollable?: boolean
  scrollAxis?: Axes
  columns?: MutableArray<Column>
  hasItemsSource?: boolean
  itemTemplateName?: string
  cellTemplateName?: string
  classNamesBuilder?: ClassNamesBuilder
}

export class DataTableBody extends Panel<IDataTableBodyArgs> {
  constructor(
    owner: any,
    args: IDataTableBodyArgs
  ) {
    super(owner, args);
  }

  @computed('args.{itemTemplateName}')
  public get itemTemplateName()
    : string | undefined {
    return this.args.itemTemplateName;
  }

  @computed('args.{cellTemplateName}')
  public get cellTemplateName()
    : string | undefined {
    return this.args.cellTemplateName;
  }

  @computed('args.{scrollable}')
  public get scrollable()
    : boolean | undefined {
    return this.args.scrollable;
  }

  @computed('args.{hasItemsSource}')
  public get hasItemsSource()
    : boolean | undefined {
    return this.args.hasItemsSource;
  }

  @computed('args.{scrollAxis}')
  public get scrollAxis()
    : Axes | undefined {
    return this.args.scrollAxis;
  }

  @computed('args.{columns}')
  public get columns()
    : MutableArray<Column> | undefined {
    return this.args.columns;
  }

  @computed('args.{classNamesBuilder}')
  public get classNamesBuilder()
    : ClassNamesBuilder | undefined {
    return this.args.classNamesBuilder;
  }

  public get classNames()
    : string {
    if (this.classNamesBuilder) {
      return `${this.classNamesBuilder('body')}`;
    }
    return '';
  }
}

export default DataTableBody.RegisterTemplate(layout);
