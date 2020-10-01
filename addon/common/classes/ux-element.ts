// @ts-ignore
import { setComponentTemplate, getComponentTemplate, TemplateFactory } from '@ember/component';
import { computed } from '@ember/object';
import Component from '@glimmer/component';
import { getOwner } from '@ember/application';
import { IEventEmmiter } from 'ember-ux-controls/common/types';

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

  protected get eventHandler()
    : IEventEmmiter {
    if (!this._eventEmmiter) {
      this._eventEmmiter = getOwner(this).lookup('service:event-emmiter') as IEventEmmiter;
    }
    return this._eventEmmiter;
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
