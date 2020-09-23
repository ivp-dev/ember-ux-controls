import { notifyPropertyChange } from '@ember/object';
import { inject } from '@ember/service';
import { computed } from '@ember/object';
import Component from '@glimmer/component';
// @ts-ignore
import { setComponentTemplate, getComponentTemplate,
  TemplateFactory
} from '@ember/component';
import { IEventEmmiter } from '../types';

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
    this.args
  }

  public get eventHandler() {
    if(!this._eventHandler) {
      throw 'EventEmmiter not set';
    }

    return this._eventHandler;
  }

  @computed('args.{logicalParent}', 'visualParent')
  protected get logicalParent() {
    return (
      this.args.logicalParent ?? 
      this._logicalParent ?? 
      this.visualParent
    );
  }

  protected set logicalParent(
    value: Component | null
  ) {
    if(this._logicalParent !== value) {
      this._logicalParent = value;
      notifyPropertyChange(this, 'logicalParent');
    }
  }

  @computed('args.{visualParent}')
  protected get visualParent() {
    return (
      this.args.visualParent ?? 
      this._visualParent
    );
  }

  protected set visualParent(
    value: Component | null
  ) {
    if(this._visualParent !== value) {
      this._visualParent = value;
      notifyPropertyChange(this, 'visualParent');
    }
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

  @inject('event-emmiter')
  private _eventHandler?: IEventEmmiter
  private _logicalParent: Component | null = null
  private _visualParent: Component | null = null
}
