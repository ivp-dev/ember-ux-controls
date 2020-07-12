import UXElement, { IUXElementArgs } from 'ember-ux-core/components/ux-element';
import { Axes } from 'ember-ux-core/common/types';
import { ClassNamesBuilder } from 'ember-ux-core/utils/bem'
import { computed } from '@ember/object';
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

  @computed('args.{classNamesBuilder}')
  get classNamesBuilder() {
    return (
      this.args.classNamesBuilder ??
      this.props?.classNamesBuilder
    );
  }

  @computed('args.{axis}')
  get axis() {
    return (
      this.args.axis ??
      this.props?.axis
    );
  }

  get classNames()
    : string {
    if (this.classNamesBuilder) {
      return `${this.classNamesBuilder('track', {
        [`$${this.axis}`]: typeof this.axis !== 'undefined'
      })}`;
    }
    return ''
  }
}

export default Track.RegisterTemplate(layout);

