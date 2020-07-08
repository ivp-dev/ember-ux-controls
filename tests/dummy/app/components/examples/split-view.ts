import Component from '@glimmer/component';
import { action } from '@ember/object';
import { Axes } from 'ember-ux-core/common/types';
import { tracked } from '@glimmer/tracking';

interface SplitViewExampleArgs { }

export default class SplitViewExample extends Component<SplitViewExampleArgs> {
  constructor(owner: any, args: SplitViewExampleArgs) {
    super(owner, args);

  }

  /*
  @axis={{this.axis}}
  @minPaneSize={{this.minPaneSize}} 
  @barSize={{this.barSize}} 
  @fluent={{this.fluent}} 
  @responsive={{this.responsive}}
  */

  @tracked
  axis: Axes = Axes.X;

  get barSize() {
    return this._barSize;
  }

  set barSize(value: number) {
    if (this._barSize !== value) {
      this._barSize = Number(value);
    }
  }

  get minPaneSize() {
    return this._minPaneSize;
  }

  set minPaneSize(value: number) {
    if (
      this._minPaneSize !== value && 
      !this.sizes.some(size => size <= value)
    ) {
      this._minPaneSize = Number(value);
    }
  }

  get fluent() {
    return this._fluent;
  }

  set fluent(value: boolean) {
    if (this._fluent !== value) {
      this._fluent = Boolean(value);
    }
  }

  get responsive() {
    return this._responsive;
  }

  set responsive(value: boolean) {
    if (this.responsive !== value) {
      this._responsive = Boolean(value);
    }
  }
  
  @tracked
  sizes: Array<number> = [...Array(3)].map(_ => 100 / 3)

  @action
  onAxisChanged(event: Event) {
    const
      target = event.target as HTMLSelectElement;

    this.axis = target.value as Axes;
  }

  @action
  onSizeChanged(sizes: Array<number>) {
    this.sizes = sizes;
  }

  private _minPaneSize: number = 5
  private _barSize: number = 15
  private _fluent: boolean = false
  private _responsive: boolean = false
}
