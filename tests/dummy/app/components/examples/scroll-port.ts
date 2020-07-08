import Component from '@glimmer/component';
import { action } from '@ember/object';
import { Axes } from 'ember-ux-core/common/types';
import { tracked } from '@glimmer/tracking';
interface ScrollPortExampleArgs {}

export default class ScrollPortExample extends Component<ScrollPortExampleArgs> {
  @tracked
  scrollAxis: Axes | '' = '';

  get delta() {
    return this._delta;
  }

  set delta(value: number) {
    if (this._delta !== value) {
      this._delta = Number(value);
    }
  }
  
  @action
  onAxisChanged(event: Event) {
    const
      target = event.target as HTMLSelectElement;

    this.scrollAxis = target.value as Axes;
  }

  private _delta: number = 50;
}
