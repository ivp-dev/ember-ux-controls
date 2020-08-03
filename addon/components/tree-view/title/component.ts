import UXElement, { IUXElementArgs } from 'ember-ux-core/components/ux-element';
import { ClassNamesBuilder } from 'ember-ux-core/utils/bem';
// @ts-ignore
import layout from './template';

interface ITreeViewTitleArgs extends IUXElementArgs {
  classNamesBuilder?: ClassNamesBuilder
}

export class TreeViewTitle extends UXElement<ITreeViewTitleArgs> {
  
}

export default TreeViewTitle.RegisterTemplate(layout);