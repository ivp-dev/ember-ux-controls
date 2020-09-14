import Component from '@glimmer/component';
import { A } from '@ember/array';
import { tracked } from '@glimmer/tracking';

interface ExamplesTableArgs {}

export default class ExamplesDataTable extends Component<ExamplesTableArgs> {
  @tracked
  scrollable: boolean = false;

  get itemsSource() {
    return this.generateItemsSource();
  }

  private generateItemsSource() {
    return A(
      [
        {'header': 'Tab 1', 'content': 'Content for tab 1'},
        {'header': 'Tab 2', 'content': 'Content for tab 2'},
        {'header': 'Tab 3', 'content': 'Content for tab 3'},
        {'header': 'Tab 4', 'content': 'Content for tab 4'},
        {'header': 'Tab 5', 'content': 'Content for tab 5'}
      ]
    )
  }
}
