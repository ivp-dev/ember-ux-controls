import ItemsControl from 'ember-ux-controls/common/classes/items-control';
import UXElement from 'ember-ux-controls/common/classes/ux-element';
import Modifier from 'ember-modifier';

export default class AddChild extends Modifier {
  public child?: unknown

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
      child.logicalParent.addChild(child);
    }

    this.child = child;
  }

  public willDestroy() {
    let
      child: unknown

    child = this.child;

    if (
      child &&
      child instanceof UXElement &&
      child.logicalParent instanceof ItemsControl &&
      child.logicalParent.hasItemsSource === false
    ) {
      child.logicalParent.removeChild(child);
    }

    this.child = void 0;
  }
}