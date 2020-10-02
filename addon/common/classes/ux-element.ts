// @ts-ignore
import { setComponentTemplate, getComponentTemplate, TemplateFactory } from '@ember/component';
import { computed } from '@ember/object';
import Component from '@glimmer/component';
import { EventArgs, IEventArgs, IEventEmmiter } from 'ember-ux-controls/common/types';
import EventEmmiter from 'ember-ux-controls/common/classes/event-emmiter';

export interface IUXElementArgs {
  logicalParent?: Component
  visualParent?: Component
}

export default class UXElement<T extends IUXElementArgs = {}> extends Component<T> {
  constructor(
    owner: any,
    args: T
  ) {
    super(owner, args);
  }

  protected get eventEmmiter()
    : IEventEmmiter {
    if (!this._eventEmmiter) {
      this._eventEmmiter = new EventEmmiter();
    }
    return this._eventEmmiter;
  }

  public addEventListener(
    context: object, 
    key: EventArgs<IEventArgs>, 
    callback: (sender: object, args: IEventArgs
  ) => void) {
    this.eventEmmiter.addEventListener(context, key, callback)
  }

  public removeEventListener(
    context: object, 
    key: EventArgs<IEventArgs>, 
    callback: (sender: object, args: IEventArgs
  ) => void) {
    this.eventEmmiter.removeEventListener(context, key, callback)
  }

  @computed('args.{logicalParent,visualParent}')
  public get logicalParent() {
    return (
      this.args.logicalParent ??
      this.args.visualParent
    );
  }

  @computed('args.{visualParent}')
  public get visualParent() {
    return this.args.visualParent;
  }

  protected static get Template()
    : unknown {
    return getComponentTemplate(this);
  }

  public static RegisterTemplate(
    templateFactory: TemplateFactory
  ): unknown {
    return setComponentTemplate(
      templateFactory,
      this
    );
  }

  private _eventEmmiter?: IEventEmmiter;
}
