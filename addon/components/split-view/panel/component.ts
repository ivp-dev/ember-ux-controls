
// @ts-ignore
import layout from './template';
import Panel, { IPanelArgs } from 'ember-ux-controls/common/classes/panel';
import { reads } from '@ember/object/computed';
import { Axes } from 'ember-ux-controls/common/types';
import { get } from '@ember/object';
import { computed } from '@ember/object';

interface IContentArgs extends IPanelArgs {
  
}

class SplitViewPanel extends Panel<IContentArgs> {
  constructor(
    owner: any,
    args: IContentArgs
  ) {
    super(owner, args);
  }

  @reads('args.barSize')
  public barSize?: number

  @reads('args.axis')
  public axis?: Axes
}

export default SplitViewPanel.RegisterTemplate(layout);