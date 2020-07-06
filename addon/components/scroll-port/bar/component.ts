import UXElement, { IUXElementArgs } from 'ember-ux-core/components/ux-element';
import { Axes } from 'ember-ux-core/common/types';
import { ClassNamesBuilder } from 'ember-ux-core/utils/bem'
import { Track } from 'ember-ux-controls/components/scroll-port/track/component';
// @ts-ignore
import layout from './template';


interface IBarArgs extends IUXElementArgs {
  classNamesBuilder?: ClassNamesBuilder,
  axis?: Axes
}

class Bar extends UXElement<IBarArgs> {
  constructor(
    owner: any,
    args: IBarArgs,
    props?: IBarArgs
  ) {
    super(owner, args, props);
  }
  get classNamesBuilder() {
    if (this.parentElement instanceof Track) {
      return this.parentElement.classNamesBuilder;
    }

    return (
      this.args.classNamesBuilder ??
      this.props?.classNamesBuilder
    );
  }

  get classNames()
    : string {
    if (this.classNamesBuilder) {
      return `${this.classNamesBuilder('bar', {
        [`$${this.args.axis}`]: typeof this.args.axis !== 'undefined'
      })}`;
    }
    return '';
  }
}

export default Bar.RegisterTemplate(layout)
