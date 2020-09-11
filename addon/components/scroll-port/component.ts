import { tracked } from '@glimmer/tracking';
import UXElement, { IUXElementArgs } from 'ember-ux-controls/common/classes/ux-element'
import bem, { ClassNamesBuilder } from 'ember-ux-controls/utils/bem';
import { action } from '@ember/object';
// @ts-ignore
import layout from './template';

import {
  Axes
} from 'ember-ux-controls/common/types';

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

  public get delta() {
    return this.args.delta ?? 50;
  }

  public get scrollAxis() {
    return this.args.scrollAxis;
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

  @action
  public updatePublicProperties(
    isX: boolean,
    isY: boolean
  ) {
    this.isX = isX;
    this.isY = isY;
  }
}

export default ScrollPort.RegisterTemplate(layout);