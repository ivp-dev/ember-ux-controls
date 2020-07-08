import Controller from '@ember/controller';
import { Axes } from 'ember-ux-core/common/types'
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
export default class Application extends Controller.extend({
  // anything which *must* be merged to prototype here
}) {
  
  @tracked axis = Axes.X
  @tracked sizes = [20, 80]
  @tracked barSize = 3
  @tracked minPaneSize = 20
  @tracked fluent = true
  @tracked responsive = true

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
