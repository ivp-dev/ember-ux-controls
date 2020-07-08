import UXElement, { IUXElementArgs } from 'ember-ux-core/components/ux-element';
import { ClassNamesBuilder } from 'ember-ux-core/utils/bem';
import { action } from '@ember/object';
// @ts-ignore
import layout from './template';
import { computed } from '@ember/object';
import { on, off } from 'ember-ux-core/utils/dom';

interface IHeaderArgs extends IUXElementArgs {
  hasItems: boolean
  isExpanded: boolean
  header: unknown,
  classNamesBuilder: ClassNamesBuilder
  toggleExpanded: () => void
}

export class Header extends UXElement<IHeaderArgs> {
  public get header() {
    return this.args.header;
  }

  @computed('args.{hasItems,isExpanded}')
  public get classNames()
    : string {
    return `${this.args.classNamesBuilder('header', {
      [`$active`]: this.args.hasItems,
      [`$expanded`]: this.args.isExpanded
    })}`;
  }

  @action
  public didInsert(
    element: HTMLElement
  ) {
    this._html = element;
    on(this._html, 'click', this.onClick);
  }

  @action
  private onClick(
    event: MouseEvent | TouchEvent
  ) {
    if(this.args.hasItems) {
      this.args.toggleExpanded();
    }
    event.preventDefault();
  }

  public willDestroy() {
    off(this._html, 'click', this.onClick)
  }

  private _html: HTMLElement | null = null
}

export default Header.RegisterTemplate(layout);