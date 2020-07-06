
import { ClassNamesBuilder } from 'ember-ux-core/utils/bem';
import { SplitView } from '../component';
import Panel, { IPanelArgs } from 'ember-ux-core/components/panel';
// @ts-ignore
import layout from './template';


interface IContentArgs extends IPanelArgs {
  hasItemsSource?: boolean
  classNamesBuilder?: ClassNamesBuilder
}

class SplitPane extends Panel<IContentArgs> {
  constructor(
    owner: any,
    args: IContentArgs,
    props?: IContentArgs
  ) {
    super(owner, args, props);
  }

  public get classNamesBuilder() {
    if (this.parentElement instanceof SplitView) {
      return this.parentElement.classNamesBuilder;
    }

    return this.args.classNamesBuilder;
  }

  public get hasItemsSource() {
    if (this.parentElement instanceof SplitView) {
      return this.parentElement.hasItemsSource;
    }

    return this.args.hasItemsSource;
  }
}

export default SplitPane.RegisterTemplate(layout);