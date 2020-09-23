import ItemsControl from 'ember-ux-controls/common/classes/items-control';
import UXElement from 'ember-ux-controls/common/classes/ux-element';
import Modifier from 'ember-modifier';
import { next } from '@ember/runloop';

export default class AddChild extends Modifier {

  public didInstall() {
    let
      child: unknown;

    [child] = [...this.args.positional];

    if (
      child &&
      child instanceof UXElement &&
      child.logicalParent instanceof ItemsControl &&
      child.logicalParent.hasItemsSource === false
    ) {
      next(this, nextCallback, child, child.logicalParent);
    }
  }

}

function nextCallback(
  child: UXElement, 
  parent: ItemsControl
  ) {
  parent.addChild(child);
}