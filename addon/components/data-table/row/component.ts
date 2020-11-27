// @ts-ignore
import layout from './template';
import UXElement, { IUXElementArgs } from 'ember-ux-controls/common/classes/ux-element';
import { DataTableItemModel } from '../component';
import MutableArray from '@ember/array/mutable';
import { reads } from '@ember/object/computed';
import { action } from '@ember/object';
import on from 'ember-ux-controls/utils/dom/on';
import off from 'ember-ux-controls/utils/dom/off';
import { IDataTableColumnContainer } from 'ember-ux-controls/components/data-table/head/component';

interface IDataTableRowArgs extends IUXElementArgs {
  columnSizes?: MutableArray<number>,
  columns?: MutableArray<IDataTableColumnContainer>
  container?: DataTableItemModel
  cellTemplateName?: string
  onSelect?: (container: unknown) => void
  onUnselect?: (container: unknown) => void
}

export class CellModel {
  constructor(
    public value: any,
    public width: number
  ) { }
}

class DataTableRow<T extends IDataTableRowArgs> extends UXElement<T> {
  @reads('args.cellTemplateName')
  public cellTemplateName?: string

  @reads('args.columns')
  public columns?: MutableArray<IDataTableColumnContainer>

  @reads('args.columnSizes')
  public columnSizes?: MutableArray<number>

  @reads('args.container')
  public container?: DataTableItemModel

  @reads('container.isSelected')
  public isSelected?: boolean

  @reads('args.onSelect')
  public onSelect?: (container: unknown) => void

  @reads('args.onUnselect')
  public onUnselect?: (container: unknown) => void

  @action
  public didInsert(element: Element) {
    on(element, 'click', this.onClickEventHandler);
    this._html = element;
  }

  public willDestroy() {
    let
      element: Element | null;

    super.willDestroy();

    element = this._html;
    if (!element) {
      return;
    }

    off(element, 'click', this.onClickEventHandler);
  }

  @action
  private onClickEventHandler() {
    if (this.isSelected === true && this.onUnselect) {
      this.onUnselect(this.container)
    } else if (this.isSelected === false && this.onSelect) {
      this.onSelect(this.container)
    }
  }

  private _html: Element | null = null;
}

export default DataTableRow.RegisterTemplate(layout);