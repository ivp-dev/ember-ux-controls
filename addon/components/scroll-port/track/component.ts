import UXElement, { IUXElementArgs } from 'ember-ux-core/components/ux-element';
import { Axes } from 'ember-ux-core/common/types';
import { ClassNamesBuilder } from 'ember-ux-core/utils/bem'
import { ScrollPort } from '../component';
// @ts-ignore
import layout from './template';


interface ITrackArgs extends IUXElementArgs {
  classNamesBuilder?: ClassNamesBuilder
  axis?: Axes
}

export class Track extends UXElement<ITrackArgs> {
  constructor(
    owner: any,
    args: ITrackArgs,
    props?: ITrackArgs
  ) {
    super(owner, args, props);
  }

  get classNamesBuilder() {
    if (this.parentElement instanceof ScrollPort) {
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
      return `${this.classNamesBuilder('track', {
        [`$${this.args.axis}`]: typeof this.args.axis !== 'undefined'
      })}`;
    }
    return ''
  }
}

export default Track.RegisterTemplate(layout);

