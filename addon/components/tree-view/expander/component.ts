
import Component from '@glimmer/component';
import { ClassNamesBuilder } from 'ember-ux-core/utils/bem';
import { computed } from '@ember/object';
// @ts-ignore
import { setComponentTemplate } from '@ember/component';
// @ts-ignore
import layout from './template';


interface ITreeViewExpanderArgs {
  isExpanded?: boolean,
  hasChilds?: boolean,
  classNamesBuilder?: ClassNamesBuilder
}
 
class TreeViewExpander extends Component<ITreeViewExpanderArgs> {

  public get classNamesBuilder() {
    return this.args.classNamesBuilder;
  }

  @computed('args.{isExpanded,hasChilds}')
  public get classNames() {
    if(this.classNamesBuilder) {
      return this.classNamesBuilder('expander', {
        [`$toggled`]: this.args.isExpanded,
        [`$toggleable`]: this.args.hasChilds, 
      });
    }

    return '';
  }
}

export default setComponentTemplate(layout, TreeViewExpander)

