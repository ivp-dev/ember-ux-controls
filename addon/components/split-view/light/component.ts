import UXElement, { IUXElementArgs } from "ember-ux-controls/common/classes/ux-element";
import { Axes, Side, Size } from 'ember-ux-controls/common/types';
import bem, { ClassNamesBuilder } from 'ember-ux-controls/utils/bem';
// @ts-ignore
import layout from './template';

export interface ISplitViewLightArgs extends IUXElementArgs {
  axis?: Axes
  responsive?: boolean,
  fluent?: boolean,
  barSize?: number,
  sizeTarget?: Size,
  sideTarget?: Side,
  sideOrigin?: Side,
  minPaneSize?: number,
  maxSizeTarget?: string,
  sizes?: Array<number>,
  minPaneSizes?: Array<number>,
  bemBlockName?: string
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
    return bem(this.args.bemBlockName ?? `split-view`, `$${this.axis}`);
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