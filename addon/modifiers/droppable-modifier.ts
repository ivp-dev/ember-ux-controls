// @ts-ignore
import { setModifierManager, capabilities } from '@ember/modifier';
import Modifier from 'ember-modifier';

export default class DroppableModifier extends Modifier {
  
  private _behavior: DroppableBehavior | null = null

  public didInstall() {
    this._behavior = new DroppableBehavior()
  }

  public didUpdateArguments() {
    
  }

  public willRemove() {
    
  }
}

class DroppableBehavior {

}