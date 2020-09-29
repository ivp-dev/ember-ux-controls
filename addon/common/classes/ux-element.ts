import {
  // @ts-ignore
  setComponentTemplate, 
  // @ts-ignore
  getComponentTemplate,
  TemplateFactory
} from '@ember/component';
import { inject } from '@ember/service';
import { computed } from '@ember/object';
import Component from '@glimmer/component';

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

  @inject('event-emmiter')
  public eventHandler!: IEventEmmiter;

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
}
