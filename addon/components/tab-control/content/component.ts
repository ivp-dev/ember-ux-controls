import UXElement, { IUXElementArgs } from 'ember-ux-core/components/ux-element';
import { ClassNamesBuilder } from 'ember-ux-core/utils/bem';
import { computed } from '@ember/object';
// @ts-ignore
import layout from './template';


interface ITabControlContentArgs extends IUXElementArgs {
  content?: unknown
  classNamesBuilder?: ClassNamesBuilder
}

class TabControlContent extends UXElement<ITabControlContentArgs> {
  @computed('args.{content}')
  public get content() {
    return this.args.content;
  }

  @computed('args.{classNamesBuilder}')
  public get classNamesBuilder() {
    return this.args.classNamesBuilder;
  }

  public get classNames() {
    if (this.classNamesBuilder) {
      return `${this.classNamesBuilder('content')}`
    }
    return '';
  }
}

export default TabControlContent.RegisterTemplate(layout);