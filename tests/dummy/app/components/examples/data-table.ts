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
        {'id': '1', 'name': 'Tom', 'age': 20},
        {'id': '2', 'name': 'Mike', 'age': 50},
        {'id': '3', 'name': 'Ted', 'age': 22},
        {'id': '4', 'name': 'Alex', 'age': 33},
        {'id': '5', 'name': 'Fred', 'age': 41}
      ]
    )
  }
}
