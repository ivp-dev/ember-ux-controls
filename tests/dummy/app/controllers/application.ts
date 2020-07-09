import Controller from '@ember/controller';
import { Axes } from 'ember-ux-core/common/types'
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { A } from '@ember/array';
import NativeArray from "@ember/array/-private/native-array";
export default class Application extends Controller.extend({
  // anything which *must* be merged to prototype here
}) {
  constructor(properies: any) {
    super(properies);

    this.tree = A(
      [
        {
          header: "Level 1", items: A(
            [
              { header: "Level 1.1" },
              { header: "Level 1.2" },
              { header: "Level 1.3" },
              { header: "Level 1.4" }
            ]
          )
        },
        {
          header: "Level 2", items: A(
            [
              { header: "Level 2.1" },
              { header: "Level 2.2" },
              { header: "Level 2.3" },
              { header: "Level 2.4" }
            ]
          )
        }
      ]
    );
  }

  @tracked tree: NativeArray<object>
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
