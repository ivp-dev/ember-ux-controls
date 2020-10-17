// @ts-ignore
import layout from './template';
import UXElement, { IUXElementArgs } from 'ember-ux-controls/common/classes/ux-element';
import { Axes, Size } from 'ember-ux-controls/common/types';
import { reads } from '@ember/object/computed';
import { computed } from '@ember/object';
import { htmlSafe } from '@ember/template';

export interface ISplitViewBarArgs extends IUXElementArgs {
  axis?: Axes
  barSize?: number
}

export class SplitViewBar<T extends ISplitViewBarArgs> extends UXElement<T> {
  @reads('args.barSize')
  public barSize?: number

  @reads('args.axis')
  public axis?: Axes

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
}

export default SplitViewBar.RegisterTemplate(layout);