import UXElement, { IUXElementArgs } from 'ember-ux-core/components/ux-element';
import { ClassNamesBuilder } from 'ember-ux-core/utils/bem'
import { computed } from '@ember/object';
// @ts-ignore
import layout from './template';


interface IScreenArgs extends IUXElementArgs {
  classNamesBuilder?: ClassNamesBuilder
}

class Screen extends UXElement<IScreenArgs> {
  constructor(
    owner: any,
    args: IScreenArgs
  ) {
    super(owner, args);
  }

  @computed('args.{classNamesBuilder}')
  get classNamesBuilder() {
    return (
      this.args.classNamesBuilder
    );
  }

  get classNames() {
    if (this.classNamesBuilder) {
      return this.classNamesBuilder('screen');
    }
    return '';
  }
}

export default Screen.RegisterTemplate(layout)