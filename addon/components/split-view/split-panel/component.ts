
import { ClassNamesBuilder } from 'ember-ux-controls/utils/bem';
import { computed } from '@ember/object';
import Panel, { IPanelArgs } from 'ember-ux-controls/common/classes/panel';
// @ts-ignore
import layout from './template';


interface IContentArgs extends IPanelArgs {
  hasItemsSource?: boolean
  classNamesBuilder?: ClassNamesBuilder
}

class SplitPane extends Panel<IContentArgs> {
  constructor(
    owner: any,
    args: IContentArgs
  ) {
    super(owner, args);
  }

  @computed('args.{classNamesBuilder}')
  public get classNamesBuilder() {
    return this.args.classNamesBuilder;
  }

  @computed('args.{hasItemsSource}')
  public get hasItemsSource() {
    return this.args.hasItemsSource;
  }
}

export default SplitPane.RegisterTemplate(layout);