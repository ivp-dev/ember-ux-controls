import UXElement, { IUXElementArgs } from "ember-ux-core/components/ux-element";
import {
  Axes,
  Side,
  Size
} from 'ember-ux-core/common/types';
import { camelize } from '@ember/string';
import bem, { ClassNamesBuilder } from 'ember-ux-core/utils/bem';
// @ts-ignore
import layout from './template';

interface ISplitViewLightArgs extends IUXElementArgs {
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
  onSizeChanged?: (sizes: Array<number>) => void
}

class SplitViewLight extends UXElement<ISplitViewLightArgs>{
  constructor(
    owner: any,
    args: ISplitViewLightArgs
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

  public get responsive()
    : boolean {
    return (
      this.args.responsive ??
      this.props?.responsive ??
      false
    );
  }

  public get fluent()
    : boolean {
    return (
      this.args.fluent ??
      this.props?.fluent ??
      false
    );
  }

  public get barSize()
    : number {
    const
      barSize = 2;

    return (
      this.args.barSize ??
      this.props?.barSize ??
      barSize
    );
  }

  public get minPaneSize()
    : number {
    const
      minPaneSize = 0;

    return (
      this.args.minPaneSize ??
      this.props?.minPaneSize ??
      minPaneSize
    );
  }

  public get axis()
    : Axes {
    return (
      this.args.axis ??
      this.props?.axis ??
      Axes.X
    );
  }

  public get maxSizeTarget()
    : string {
    return camelize('max-' + this.sizeTarget);
  }

  public get sideOrigin()
    : Side {
    return this.axis === Axes.X
      ? Side.Left
      : Side.Top;
  }

  public get sideTarget()
    : Side {
    return this.axis === Axes.X
      ? Side.Right
      : Side.Bottom;
  }

  public get sizeTarget()
    : Size {
    return this.axis === Axes.X
      ? Size.Width
      : Size.Height;
  }
}

export default SplitViewLight.RegisterTemplate(layout)