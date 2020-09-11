import UXElement, { IUXElementArgs } from 'ember-ux-controls/common/classes/ux-element';
import { Axes } from 'ember-ux-controls/common/types';
import { ClassNamesBuilder } from 'ember-ux-controls/utils/bem'
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
    args: ITrackArgs
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
      return `${this.classNamesBuilder('track', {
        [`$${this.axis}`]: typeof this.axis !== 'undefined'
      })}`;
    }
    return ''
  }
}

export default Track.RegisterTemplate(layout);

