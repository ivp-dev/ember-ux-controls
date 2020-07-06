import UXElement, { IUXElementArgs } from 'ember-ux-core/components/ux-element';
import { ClassNamesBuilder } from 'ember-ux-core/utils/bem';
import { TabItem } from '../tab-item/component';
// @ts-ignore
import layout from './template';


interface IHeaderArgs extends IUXElementArgs {
  header?: unknown,
  classNamesBuilder?: ClassNamesBuilder
}

export class Header extends UXElement<IHeaderArgs> {
  public get header()
    : unknown {
    if (this.parentElement instanceof TabItem) {
      return this.parentElement.header;
    }
    return this.args.header;
  }

  public get classNames()
    : string {
    if (this.parentElement instanceof TabItem &&
      typeof this.parentElement.classNamesBuilder !== 'undefined'
    ) {
      return `${this.parentElement.classNamesBuilder('header')}`;
    }

    if (this.args.classNamesBuilder) {
      return `${this.args.classNamesBuilder('header')}`;
    }

    return '';
  }
}

export default Header.RegisterTemplate(layout);