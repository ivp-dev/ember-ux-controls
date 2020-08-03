import UXElement, { IUXElementArgs } from 'ember-ux-core/components/ux-element';
import { ClassNamesBuilder } from 'ember-ux-core/utils/bem';
import { action } from '@ember/object';
import { reads } from '@ember/object/computed';
// @ts-ignore
import layout from './template';

interface ITreeViewHeaderArgs extends IUXElementArgs {
  header?: unknown
  hasChilds?: boolean
  isExpanded?: boolean
  isSelected?: boolean
  titleTemplateName?: string
  expanderTemplateName?: string
  toggleExpander?: () => void
  changeSelection?: (value: boolean) => void
  classNamesBuilder?: ClassNamesBuilder
}

export class TreeViewHeader extends UXElement<ITreeViewHeaderArgs> {
  @reads('args.header') 
  public header?: unknown

  @reads('args.hasChilds') 
  public hasChilds?: boolean

  @reads('args.isExpanded') 
  public isExpanded?: boolean

  @reads('args.isSelected') 
  public isSelected?: boolean

  @reads('args.titleTemplateName') 
  public titleTemplateName?: string

  @reads('args.expanderTemplateName') 
  public expanderTemplateName?: string

  @reads('args.toggleExpander') 
  public toggleExpander?: () => void

  @reads('args.changeSelection') 
  public changeSelection?: (value: boolean) => void

  @reads('args.classNamesBuilder') 
  public classNamesBuilder?: ClassNamesBuilder

  public get classNames()
    : string {
    if (this.classNamesBuilder) {
      return `${this.classNamesBuilder('header')}`;
    }

    return ''
  }

  @action
  onClick(e: Event) {
    if (this.changeSelection) {
      debugger
      this.changeSelection(!this.isSelected)
    }

    e.preventDefault();
  }
}

export default TreeViewHeader.RegisterTemplate(layout);