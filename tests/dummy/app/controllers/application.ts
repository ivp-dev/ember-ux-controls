import Controller from '@ember/controller';
import { Axes } from 'ember-ux-controls/common/types'
import { action } from '@ember/object';


export default class Application extends Controller.extend({
  // anything which *must* be merged to prototype here
}) {
  constructor(properies: any) {
    super(properies);
  }

  public sizes = [20, 80]
  public axis = Axes.X
  public barSize = 3
  public minPaneSize = 20
  public fluent = true
  public responsive = true

  @action
  onSizeChanged(sizes: Array<number>) {
    this.sizes = sizes
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your controllers.
declare module '@ember/controller' {
  interface Registry {
    'application': Application;
  }
}
