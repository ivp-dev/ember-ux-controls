import UXElement, { IUXElementArgs } from 'ember-ux-core/components/ux-element';
import { ClassNamesBuilder } from 'ember-ux-core/utils/bem';
// @ts-ignore
import layout from './template';

interface ITreeViewTitleArgs extends IUXElementArgs {
  classNamesBuilder?: ClassNamesBuilder
}

export class TreeViewTitle extends UXElement<ITreeViewTitleArgs> {
  public get classNamesBuilder() {
    return this.args.classNamesBuilder;
  }

  public get classNames()
    : string {
    if (this.classNamesBuilder) {
      return `${this.classNamesBuilder('title')}`;
    }

    return ''
  }
}

export default TreeViewTitle.RegisterTemplate(layout);