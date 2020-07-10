
import Component from '@glimmer/component';
import { ClassNamesBuilder } from 'ember-ux-core/utils/bem';
// @ts-ignore
import { setComponentTemplate } from '@ember/component';
// @ts-ignore
import layout from './template';


interface ITreeViewHeaderPresenter {
  isExpanded?: boolean,
  hasChilds?: boolean,
  header?: unknown,
  classNamesBuilder?: ClassNamesBuilder
}

class TreeViewHeaderPresenter extends Component<ITreeViewHeaderPresenter> {
}

export default setComponentTemplate(layout, TreeViewHeaderPresenter)

