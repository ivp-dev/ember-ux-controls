
// @ts-ignore
import layout from './template';
import Panel, { IPanelArgs } from 'ember-ux-controls/common/classes/panel';
import { reads } from '@ember/object/computed';
import { Axes } from 'ember-ux-controls/common/types';
import ItemCollection from 'ember-ux-controls/common/classes/-private/item-collection';

interface ISplitViewPanelArgs extends IPanelArgs {
  view?: ItemCollection
  itemTemplateName?: string
}

class SplitViewPanel extends Panel<ISplitViewPanelArgs> {
  constructor(
    owner: any,
    args: ISplitViewPanelArgs
  ) {
    super(owner, args);
  }

  @reads('args.itemContainerGenerator.view')
  public view?: ItemCollection

  @reads('args.itemTemplateName')
  public itemTemplateName?:string

  @reads('args.barSize')
  public barSize?: number

  @reads('args.axis')
  public axis?: Axes
}

export default SplitViewPanel.RegisterTemplate(layout);