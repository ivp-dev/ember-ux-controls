// @ts-ignore
import layout from './template';
import UXElement, { IUXElementArgs } from "ember-ux-controls/common/classes/ux-element";
import { Axes } from 'ember-ux-controls/common/types';
import { action } from '@ember/object';


export interface ISplitViewLightArgs extends IUXElementArgs {
  axis?: Axes
  responsive?: boolean,
  fluent?: boolean,
  barSize?: number,
  minSize?: number,
  maxSizeTarget?: string,
  sizes?: Array<number>,
  minSizes?: Array<number>,
  onSizeChanged?: (sizes: Array<number>) => void
}

export class SplitViewLight<T extends ISplitViewLightArgs> extends UXElement<T>{
  constructor(
    owner: any,
    args: T
  ) {
    super(owner, args)
  }

  public get axis()
    : Axes {
    return (
      this.args.axis ??
      Axes.X
    );
  }

  @action
  public didUpdateAttrs() {
    
  }
}

export default SplitViewLight.RegisterTemplate(layout)