
import { ClassNamesBuilder } from 'ember-ux-controls/utils/bem';
import { reads } from '@ember/object/computed';
import { action } from '@ember/object';
import UXElement, { IUXElementArgs } from 'ember-ux-controls/common/classes/ux-element';
// @ts-ignore
import layout from './template';

interface ITreeViewExpanderArgs extends IUXElementArgs {
  isExpanded?: boolean,
  hasChilds?: boolean,
  toggleExpander?: () => void;
  classNamesBuilder?: ClassNamesBuilder
}

class TreeViewExpander extends UXElement<ITreeViewExpanderArgs> {
  @reads('args.isExpanded') 
  public isExpanded?: boolean

  @reads('args.hasChilds') 
  public hasChilds?: boolean

  @reads('args.toggleExpander') 
  public toggleExpander?: () => void;

  @reads('args.classNamesBuilder') 
  classNamesBuilder?: ClassNamesBuilder

  public get classNames() {
    if (this.classNamesBuilder) {
      return this.classNamesBuilder('expander', {
        [`$toggled`]: this.isExpanded,
        [`$toggleable`]: this.hasChilds,
      });
    }

    return '';
  }

  @action
  onClick(event: Event) {
    if (this.toggleExpander) {
      this.toggleExpander();
    }
    event.preventDefault();
  }
}

export default TreeViewExpander.RegisterTemplate(layout);

