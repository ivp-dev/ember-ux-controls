// @ts-ignore
import layout from './template';
import Panel, { IPanelArgs } from 'ember-ux-controls/common/classes/panel';
import { Axes } from 'ember-ux-controls/common/types';
import { reads } from '@ember/object/computed';

interface ITabPaneArgs extends IPanelArgs {
  scrollable?: boolean
  scrollAxis?: Axes
  hasItemsSource?: boolean
  contentPresenter?: Element
  itemTemplateName?: string
  headerTemplateName?: string
  contentTemplateName?: string
  onSelect: (container: unknown) => void
  onUnselect: (container: unknown) => void
}

export class TabControlPanel extends Panel<ITabPaneArgs> {
  constructor(
    owner: any,
    args: ITabPaneArgs
  ) {
    super(owner, args);
  }

  @reads('args.itemTemplateName')
  public itemTemplateName?: string

  @reads('args.headerTemplateName')
  public headerTemplateName?: string

  @reads('args.contentTemplateName')
  public contentTemplateName?: string

  @reads('args.scrollable')
  public scrollable?: boolean
  
  @reads('args.hasItemsSource')
  public hasItemsSource?: boolean

  @reads('args.scrollAxis')
  public scrollAxis?: Axes

  @reads('args.contentPresenter')
  public contentPresenter?: Element

  @reads('args.onSelect')
  public onSelect?: (container: unknown) => void

  @reads('args.onUnselect')
  public onUnselect?: (container: unknown) => void
}

export default TabControlPanel.RegisterTemplate(layout);
