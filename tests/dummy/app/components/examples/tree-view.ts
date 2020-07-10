import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

interface ExamplesTreeViewArgs {}

export default class ExamplesTreeView extends Component<ExamplesTreeViewArgs> {
  @tracked
  multipleSelectionEnable: boolean = false;
}
