import UXElement, { IUXElementArgs } from 'ember-ux-core/components/ux-element';
import { ClassNamesBuilder } from 'ember-ux-core/utils/bem';
// @ts-ignore
import layout from './template';

interface ITreeViewHeaderArgs extends IUXElementArgs {
  classNamesBuilder?: ClassNamesBuilder
}

export class TreeViewHeader extends UXElement<ITreeViewHeaderArgs> {
  public get classNamesBuilder() {
    return this.args.classNamesBuilder;
  }

  public get classNames()
    : string {
    if (this.classNamesBuilder) {
      return `${this.classNamesBuilder('header')}`;
    }

    return ''
  }
}

export default TreeViewHeader.RegisterTemplate(layout);