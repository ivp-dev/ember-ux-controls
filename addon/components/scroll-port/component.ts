import { tracked } from '@glimmer/tracking';
import UXElement, { IUXElementArgs } from 'ember-ux-core/components/ux-element'
import bem, { ClassNamesBuilder } from 'ember-ux-core/utils/bem';
// @ts-ignore
import layout from './template';

import {
  Axes
} from 'ember-ux-core/common/types';

export interface IScrollPortArgs extends IUXElementArgs {
  scrollAxis?: Axes,
  delta?: number
}

export class ScrollPort extends UXElement<IScrollPortArgs> {
  constructor(
    owner: unknown,
    args: IScrollPortArgs
  ) {
    super(owner, args);
  }

  @tracked 
  public isX: boolean = false
  
  @tracked 
  public isY: boolean = false

  public get classNamesBuilder()
    : ClassNamesBuilder {
    return bem('scroll-port', {
      [`$${Axes.X}-visible`]: this.isX,
      [`$${Axes.Y}-visible`]: this.isY
    });
  }

  public get classNames()
    : string {
    return `${this.classNamesBuilder}`;
  }
}

export default ScrollPort.RegisterTemplate(layout);