import UXElement, { IUXElementArgs } from 'ember-ux-core/components/ux-element';
import { ClassNamesBuilder } from 'ember-ux-core/utils/bem';
// @ts-ignore
import layout from './template';
import { computed } from '@ember/object';

interface IExpanderArgs extends IUXElementArgs {
  isExpanded?: boolean,
  hasChilds?: boolean,
  classNamesBuilder?: ClassNamesBuilder
}

export class Expander extends UXElement<IExpanderArgs> {
  constructor(
    owner: any,
    args: IExpanderArgs,
    props?: IExpanderArgs
  ) {
    super(owner, args, props);
  }

  public get classNamesBuilder() {
    return this.args.classNamesBuilder;
  }

  @computed('args.{isExpanded}')
  public get classNames() {
    if(this.classNamesBuilder) {
      return this.classNamesBuilder('expander', {
        [`$open`]: this.args.isExpanded,
        [`$close`]: !this.args.isExpanded
      });
    }

    return '';
  }
}

export default Expander.RegisterTemplate(layout);
