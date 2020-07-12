import UXElement, { IUXElementArgs } from 'ember-ux-core/components/ux-element';
import { ClassNamesBuilder } from 'ember-ux-core/utils/bem';
// @ts-ignore
import layout from './template';


interface ITabControlContentPresenterArgs extends IUXElementArgs {
  content?: unknown
  hasItemsSource?: boolean
  classNamesBuilder?: ClassNamesBuilder
}

class TabControlContentPresenter extends UXElement<ITabControlContentPresenterArgs> {
  public get content() {
    return this.args.content;
  }

  public get classNamesBuilder() {
    return this.args.classNamesBuilder;
  }
}

export default TabControlContentPresenter.RegisterTemplate(layout);