import UXElement, { IUXElementArgs } from 'ember-ux-controls/common/classes/ux-element';
import { ClassNamesBuilder } from 'ember-ux-controls/utils/bem';
// @ts-ignore
import layout from './template';

interface ITreeViewTitleArgs extends IUXElementArgs {
  classNamesBuilder?: ClassNamesBuilder
}

export class TreeViewTitle extends UXElement<ITreeViewTitleArgs> {
  
}

export default TreeViewTitle.RegisterTemplate(layout);