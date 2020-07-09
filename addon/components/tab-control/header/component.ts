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
    return this.args.header;
  }

  public get classNames()
    : string {
    if (this.args.classNamesBuilder) {
      return `${this.args.classNamesBuilder('header')}`;
    }

    return '';
  }
}

export default Header.RegisterTemplate(layout);