import Component from '@glimmer/component';
import { action } from '@ember/object';
import { Axes } from 'ember-ux-controls/common/types';
import { tracked } from '@glimmer/tracking';
import { notifyPropertyChange } from '@ember/object';

interface SplitViewExampleArgs { }

export default class SplitViewExample extends Component<SplitViewExampleArgs> {
  constructor(owner: any, args: SplitViewExampleArgs) {
    super(owner, args);

    this._sizes = [...Array(3)].map(_ => 100 / 3);
  }

  @tracked
  public axis: Axes = Axes.X;

  public get barSize() {
    return this._barSize;
  }

  public set barSize(value: number) {
    if (this._barSize !== value) {
      this._barSize = Number(value);
    }
  }

  public get minSize() {
    return this._minSize;
  }

  public set minSize(value: number) {
    if (
      this._minSize !== value && 
      !this.sizes.some(size => size <= value)
    ) {
      this._minSize = Number(value);
    }
  }

  public get fluent() {
    return this._fluent;
  }

  public set fluent(value: boolean) {
    if (this._fluent !== value) {
      this._fluent = Boolean(value);
    }
  }

  public get responsive() {
    return this._responsive;
  }

  public set responsive(value: boolean) {
    if (this.responsive !== value) {
      this._responsive = Boolean(value);
    }
  }
  
  public get sizes() {
    return this._sizes;
  }

  @action
  public onAxisChanged(event: Event) {
    const
      target = event.target as HTMLSelectElement;

    this.axis = target.value as Axes;
  }

  @action
  public onSizeChanged(sizes: Array<number>) {
    this._sizes = sizes;
    notifyPropertyChange(this, 'sizes');
  }

  private _sizes: Array<number>
  private _minSize: number = 5
  private _barSize: number = 15
  private _fluent: boolean = false
  private _responsive: boolean = false
}
