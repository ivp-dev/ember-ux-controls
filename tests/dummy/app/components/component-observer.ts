import Component from '@glimmer/component';
import { computed } from '@ember/object';
import { defineProperty } from '@ember/object';

interface ComponentObserverArgs {

}

export default class ComponentObserver extends Component<ComponentObserverArgs> {
  private _dirty: boolean = false

  constructor(
    owner: any,
    args: ComponentObserverArgs
  ) {
    super(owner, args);

    let
      prop: string;

    for (prop of Object.keys(args)) {
      defineProperty(this, prop, computed.alias(`args.${prop}`));
    }

    defineProperty(this, 'isDirty', computed.apply(
      this,
      [...Object.keys(this.args),
      () => {
        return this._dirty = !this._dirty;
      }]
    )
    );
  }
}

function convertTo(type: string, value: any) {
  switch (type) {
    case 'number':
      return Number(value);
    case 'boolean':
      return value == 'true'
  }

  return value;
}
