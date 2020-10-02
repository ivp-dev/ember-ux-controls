import ItemsControl from 'ember-ux-controls/common/classes/items-control';
import UXElement from 'ember-ux-controls/common/classes/ux-element';
import Modifier from 'ember-modifier';
import { scheduleOnce } from '@ember/runloop';

export default class AddChild extends Modifier {
  public didInstall() {
    const
      [child] = [...this.args.positional];

    if (
      child &&
      child instanceof UXElement &&
      child.logicalParent instanceof ItemsControl &&
      child.logicalParent.hasItemsSource === false
    ) {
      const
        logicalParent = child.logicalParent;

      if (!logicalParent.items.cacher.isActive) {
        logicalParent.items.cacher.delay();
      }

      child.logicalParent.addChild(child);
      scheduleOnce('actions', this, () => { logicalParent.items.cacher.apply(); })
    }
  }
}