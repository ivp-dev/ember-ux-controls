
// @ts-ignore
import layout from './template';
import { ClassNamesBuilder } from 'ember-ux-controls/utils/bem';
import Panel, { IPanelArgs } from 'ember-ux-controls/common/classes/panel';
import { reads } from '@ember/object/computed';
import { Axes } from 'ember-ux-controls/common/types';

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

  @reads('args.{classNamesBuilder}')
  public classNamesBuilder?: ClassNamesBuilder

  @reads('args.{barSize}')
  public barSize?: ClassNamesBuilder

  @reads('args.{axis}')
  public axis?: Axes

  @reads('args.{hasItemsSource}')
  public hasItemsSource?: boolean
}

export default SplitPane.RegisterTemplate(layout);