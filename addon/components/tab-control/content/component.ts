import UXElement, { IUXElementArgs } from 'ember-ux-core/components/ux-element';
import { ClassNamesBuilder } from 'ember-ux-core/utils/bem';
import { TabItem } from '../tab-item/component';
// @ts-ignore
import layout from './template';


interface IContentArgs extends IUXElementArgs {
  content?: unknown
  hasItemsSource?: boolean
  classNamesBuilder?: ClassNamesBuilder
}

class Content extends UXElement<IContentArgs> {
  public get content() {
    if(this.parentElement instanceof TabItem) {
      return this.parentElement.content;
    }

    return this.args.content;
  }

  public get classNamesBuilder() {
    if(this.parentElement instanceof TabItem) {
      return this.parentElement.classNamesBuilder;
    }

    return this.args.classNamesBuilder;
  }

  public get hasItemsSource() {
    if(this.parentElement instanceof TabItem) {
      return this.parentElement.hasItemsSource;
    }

    return this.args.hasItemsSource;
  }
}

export default Content.RegisterTemplate(layout);