import UXElement, { IUXElementArgs } from 'ember-ux-core/components/ux-element';
import { Axes } from 'ember-ux-core/common/types';
import { ClassNamesBuilder } from 'ember-ux-core/utils/bem'
import { computed } from '@ember/object';
// @ts-ignore
import layout from './template';


interface IBarArgs extends IUXElementArgs {
  classNamesBuilder?: ClassNamesBuilder,
  axis?: Axes
}

class Bar extends UXElement<IBarArgs> {
  constructor(
    owner: any,
    args: IBarArgs
  ) {
    super(owner, args);
  }

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

  get classNames()
    : string {
    if (this.classNamesBuilder) {
      return `${this.classNamesBuilder('bar', {
        [`$${this.axis}`]: typeof this.axis !== 'undefined'
      })}`;
    }
    return '';
  }
}

export default Bar.RegisterTemplate(layout)
