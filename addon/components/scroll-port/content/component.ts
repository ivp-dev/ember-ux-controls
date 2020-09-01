import UXElement, { IUXElementArgs } from 'ember-ux-core/components/ux-element';
import { Axes } from 'ember-ux-core/common/types';
import { ClassNamesBuilder } from 'ember-ux-core/utils/bem'
import { computed } from '@ember/object';
// @ts-ignore
import layout from './template';


interface IContentArgs extends IUXElementArgs {
  classNamesBuilder?: ClassNamesBuilder,
  axis?: Axes
}

class Content extends UXElement<IContentArgs> {
  
  @computed('args.{classNamesBuilder}')
  get classNamesBuilder() {
    return (
      this.args.classNamesBuilder
    );
  }

  @computed('args.{axis}')
  get axis() {
    return (
      this.args.axis
    );
  }

  get classNames(): string {
    if (this.classNamesBuilder) {
      return `${this.classNamesBuilder('content', {
        [`$${Axes.X}`]: !this.axis || this.axis === Axes.X,
        [`$${Axes.Y}`]: !this.axis || this.axis === Axes.Y,
      })}`;
    }

    return '';
  }
}

export default Content.RegisterTemplate(layout)