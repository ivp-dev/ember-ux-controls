import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { A } from '@ember/array';
import { computed } from '@ember/object';

interface ExamplesTreeViewArgs { }

export default class ExamplesTreeView extends Component<ExamplesTreeViewArgs> {
  @tracked
  multipleSelectionEnable: boolean = false;

  @tracked
  itemsSourceEnable: boolean = true

  @computed('itemsSourceEnable')
  get itemsSource() {
    if (this.itemsSourceEnable) {
      return this.generateItemsSource();
    }

    return null;
  }

  private generateItemsSource() {
    return A([{
      header: "Dynamic level 1", items: A(
        [
          { header: "Dynamic level 1.1" },
          { header: "Dynamic level 1.2" },
          { header: "Dynamic level 1.3" },
          { header: "Dynamic level 1.4" }
        ]
      )
    }, {
      header: "Dynamic level 2", items: A(
        [
          { header: "Dynamic level 2.1" },
          { header: "Dynamic level 2.2" },
          { header: "Dynamic level 2.3" },
          { header: "Dynamic level 2.4" }
        ]
      )
    }]);
  }
}
