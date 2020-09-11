import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { Side, Direction } from 'ember-ux-controls/common/types';
import { computed } from '@ember/object';
import { A } from '@ember/array';
interface TabControlExampleArgs { }

export default class TabControlExample extends Component<TabControlExampleArgs> {
  @tracked
  toggleable: boolean = false;

  @tracked
  side: Side = Side.Top;

  @tracked
  direction: Direction = Direction.Forward;

  @tracked
  scrollable: boolean = false;

  @tracked
  selectFirst: boolean = true;

  @tracked
  itemsSourceEnable: boolean = false

  @action
  onSideChanged(event: Event) {
    const
      target = event.target as HTMLSelectElement;

    this.side = target.value as Side;
  }

  @computed('itemsSourceEnable')
  get itemsSource() {
    if (this.itemsSourceEnable) {
      return this.generateItemsSource();
    }

    return null;
  }

  @action
  onDirectionChanged(event: Event) {
    const
      target = event.target as HTMLSelectElement;

    this.direction = target.value as Direction;
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
