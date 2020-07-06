import UXElement, { IUXElementArgs } from 'ember-ux-core/components/ux-element';
import { Axes } from 'ember-ux-core/common/types';
import { ClassNamesBuilder } from 'ember-ux-core/utils/bem'
import { ScrollPort } from '../component';
// @ts-ignore
import layout from './template';


interface IContentArgs extends IUXElementArgs {
  classNamesBuilder?: ClassNamesBuilder,
  axis?: Axes
}

class Content extends UXElement<IContentArgs> {
  get classNamesBuilder() {
    if (this.parentElement instanceof ScrollPort) {
      return this.parentElement.classNamesBuilder;
    }

    return (
      this.args.classNamesBuilder ??
      this.props?.classNamesBuilder
    );
  }

  get classNames(): string {
    if (this.classNamesBuilder) {
      return `${this.classNamesBuilder('content', {
        [`$${Axes.X}`]: !this.args.axis || this.args.axis === Axes.X,
        [`$${Axes.Y}`]: !this.args.axis || this.args.axis === Axes.Y,
      })}`;
    }

    return '';
  }
}

export default Content.RegisterTemplate(layout)