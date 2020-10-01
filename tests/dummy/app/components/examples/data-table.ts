import Component from '@glimmer/component';
import { A } from '@ember/array';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { notifyPropertyChange } from '@ember/object';
interface ExamplesTableArgs {}

export default class ExamplesDataTable extends Component<ExamplesTableArgs> {
  constructor(owner: any, args: ExamplesTableArgs) {
    super(owner, args);

    this._columnMinSize = 0;
    this._sizes = [...Array(3)].map(_ => 100 / 3);
  }

  @tracked
  public scrollable: boolean = false;

  @tracked 
  public columnFluent: boolean = false;

  @tracked
  public columnResponsive: boolean = false

  @tracked
  public columnBarSize: number = 1

  @tracked
  public multipleSelectionEnable: boolean = false;

  public get columnMinSize() {
    return this._columnMinSize;
  }

  public set columnMinSize(value: number) {
    if (
      this._columnMinSize !== value && 
      !this.columnSizes.some(size => size <= value)
    ) {
      this._columnMinSize = Number(value);
    }
  }

  public get columnSizes() {
    return this._sizes;
  }

  public get itemsSource() {
    return this.generateItemsSource();
  }

  @action
  public onColumnSizeChanged(sizes: Array<number>) {
    this._sizes = sizes;
    notifyPropertyChange(this, 'columnSizes');
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

  private _sizes: Array<number>;
  private _columnMinSize: number
}
