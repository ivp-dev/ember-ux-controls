// @ts-ignore
import layout from './template';
import UXElement, { IUXElementArgs } from 'ember-ux-controls/common/classes/ux-element';
import bem, { ClassNamesBuilder } from 'ember-ux-controls/utils/bem';
import { Axes, Size } from 'ember-ux-controls/common/types';
import { reads } from '@ember/object/computed';
import { computed } from '@ember/object';
import { htmlSafe } from '@ember/template';

export interface ISplitViewBarArgs extends IUXElementArgs {
  axis?: Axes
  barSize?: number
  classNamesBuilder?: ClassNamesBuilder
}

export class SplitViewBar<T extends ISplitViewBarArgs> extends UXElement<T> {
  @computed('args.{barSize}')
  public get barSize() {
    return this.args.barSize;
  }

  @computed('args.{axis}')
  public get axis(){
    return this.args.axis;
  }

  @computed('barSize', 'axis')
  public get style() {
    let
      barSize: number

    barSize = this.barSize ?? 0;
    return htmlSafe(this.axis === Axes.Y
      ? `${Size.Height}: ${barSize}px`
      : `${Size.Width}: ${barSize}px`
    );
  }

  public get classNamesBuilder() {
    return bem('split-view');
  }

  @computed('axis')
  public get classNames() {
    return `${this.classNamesBuilder('bar', {[`$${this.axis}`]: true})}`;
  }
}

export default SplitViewBar.RegisterTemplate(layout);