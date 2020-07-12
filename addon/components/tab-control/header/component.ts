import UXElement, { IUXElementArgs } from 'ember-ux-core/components/ux-element';
import { ClassNamesBuilder } from 'ember-ux-core/utils/bem';
// @ts-ignore
import layout from './template';


interface ITabControlHeaderArgs extends IUXElementArgs {
  header?: unknown,
  classNamesBuilder?: ClassNamesBuilder
}

export class TabControlHeader extends UXElement<ITabControlHeaderArgs> {
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

export default TabControlHeader.RegisterTemplate(layout);