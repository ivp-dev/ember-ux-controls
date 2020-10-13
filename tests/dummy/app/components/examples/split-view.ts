import Component from '@glimmer/component';
import { action } from '@ember/object';
import { Axes } from 'ember-ux-controls/common/types';
import { tracked } from '@glimmer/tracking';
import { notifyPropertyChange } from '@ember/object';

interface SplitViewExampleArgs { }

export default class SplitViewExample extends Component<SplitViewExampleArgs> {
  constructor(owner: any, args: SplitViewExampleArgs) {
    super(owner, args);

    this._sizes = [...this.randomSize(3, 100)];
    this._currentSizes = [...this._sizes];
  }

  @tracked
  public axis?: Axes;

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
      notifyPropertyChange(this, 'minSize')
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

  public set sizes(value: Array<number>) {
    if (this._sizes !== value) {
      this._sizes = value;
      notifyPropertyChange(this, 'sizes');
    }
  }

  public get currentSizes() {
    return this._currentSizes;
  }

  public set currentSizes(value: Array<number>) {
    if (this._currentSizes !== value) {
      this._currentSizes = value;
      notifyPropertyChange(this, 'currentSizes');
    }
  }

  @action
  public onAxisChanged(event: Event) {
    const
      target = event.target as HTMLSelectElement;

    this.axis = target.value as Axes;
  }

  @action
  public onSizeChanged(sizes: Array<number>) {
    this.currentSizes = [...sizes];
    this.sizes.length = 0;
    this.sizes.push(...sizes);
  }

  @action
  public setRandomSize() {
    this.sizes = this.randomSize(3, 100);
  }

  private randomSize(count: number, sum: number) {
    let
      sizes: Array<number>,
      idx: number,
      sub: number,
      min: number;

    sizes = Array(count);
    sub = 0;

    while (true) {
      for (idx = 0, sub = 0; idx < count; idx++) {
        sizes[idx] = Math.random();
        sub += sizes[idx];
      }

      min = (this.minSize - 0.00001) * sub / 100;

      if (!sizes.some(value => value < min)) {
        break;
      }
    }

    //normalize
    for (idx = 0; idx < count; idx++) {
      sizes[idx] /= sub;
      sizes[idx] *= sum;
    }

    return sizes;
  }

  private _sizes: Array<number>
  private _currentSizes: Array<number>
  private _minSize: number = 5
  private _barSize: number = 15
  private _fluent: boolean = false
  private _responsive: boolean = false
}
