// @ts-ignore
import { setModifierManager, capabilities } from '@ember/modifier';
import Modifier from 'ember-modifier';
import { inject } from '@ember/service';
import { IEventEmmiter } from 'ember-ux-controls/common/types'
import { ClassNamesBuilder } from 'ember-ux-controls/utils/bem';
import addClass from 'ember-ux-controls/utils/dom/add-class';
import { removeClass } from 'ember-ux-controls/utils/dom';
import { action } from '@ember/object';
import { IEventArgs } from 'ember-ux-controls/common/classes/-private/event-emmiter';

class DragEventArgs implements IEventArgs {
  constructor(
    public type: string
  ) { }
}


export default class DraggableModifier extends Modifier {
  @inject
  private eventEmmiter!: IEventEmmiter 

  private behavior: DraggableBehavior

  public didInstall() {
    this.behavior = new DraggableBehavior(
      this.element,
      this.eventEmmiter,
      null
    );



  }

  public didUpdateArguments() {
    
  }

  public willRemove() {
    
  }
}

class DraggableBehavior {
  constructor(
    private element: Element,
    private eventEmmiter: IEventEmmiter,
    private classNamesBuilder: ClassNamesBuilder,
    private isDraggin: boolean = false
  ) {
    this.subscribe();
  } 

  subscribe() {
    this.eventEmmiter.addEventListener(this, DragEventArgs, this.onDrag);
  }

  unsubscribe() {
    this.eventEmmiter.removeEventListener(this, DragEventArgs, this.onDrag);
  }

  onDrag(sender: any, args: DragEventArgs) {
    switch(args.type) {
      case 'start': 
        //this.onDragStart
      break
      case 'move':
        //this.onDragMove
      break
      case 'end': 
        //this.onDragEnd
      break
      default:

      
    }
  }
}