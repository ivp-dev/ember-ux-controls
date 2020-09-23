import UXElement, { IUXElementArgs } from "ember-ux-controls/common/classes/ux-element";
import { Axes } from 'ember-ux-controls/common/types';
import bem, { ClassNamesBuilder } from 'ember-ux-controls/utils/bem';

// @ts-ignore
import layout from './template';

export interface ISplitViewLightArgs extends IUXElementArgs {
  axis?: Axes
  responsive?: boolean,
  fluent?: boolean,
  barSize?: number,
  minPaneSize?: number,
  maxSizeTarget?: string,
  sizes?: Array<number>,
  minPaneSizes?: Array<number>,
  onSizeChanged?: (sizes: Array<number>) => void
}

export class SplitViewLight<T extends ISplitViewLightArgs> extends UXElement<T>{
  constructor(
    owner: any,
    args: T
  ) {
    super(owner, args)
  }

  public get classNamesBuilder()
    : ClassNamesBuilder {
    return bem(`split-view`, `$${this.axis}`);
  }

  public get classNames()
    : string {
    return `${this.classNamesBuilder}`;
  }

  public get axis()
    : Axes {
    return (
      this.args.axis ??
      Axes.X
    );
  }
}

export default SplitViewLight.RegisterTemplate(layout)