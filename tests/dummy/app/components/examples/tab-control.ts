import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { Side, Direction } from 'ember-ux-core/common/types';

interface TabControlExampleArgs {}

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

  @action
  onSideChanged(event: Event) {
    const
      target = event.target as HTMLSelectElement ;
    
    this.side = target.value as Side;
  }

  @action
  onDirectionChanged(event: Event) {
    const
      target = event.target as HTMLSelectElement ;
    
    this.direction = target.value as Direction;
  }
}
