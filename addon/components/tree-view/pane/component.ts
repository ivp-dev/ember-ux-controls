import Panel, { IPanelArgs } from 'ember-ux-core/components/panel';
import { ClassNamesBuilder } from 'ember-ux-core/utils/bem';
// @ts-ignore
import layout from './template';

interface ITreeViewPaneArgs extends IPanelArgs {
  isRoot?: boolean,
  isExpanded?: boolean,
  hasItemsSource?: boolean,
  itemTemplateName?: string
  classNamesBuilder?: ClassNamesBuilder,
  multipleSelectionEnable?: boolean
}

export class TreeViewPane extends Panel<ITreeViewPaneArgs> {
  constructor(
    owner: any,
    args: ITreeViewPaneArgs
  ) {
    super(owner, args);
  }

  public get classNamesBuilder() {
    return this.args.classNamesBuilder
  }

  public get itemTemplateName() {
    return this.args.itemTemplateName;
  }

  public get hasItemsSource() {
    return this.args.hasItemsSource;
  }

  public get isExpanded() {
    return this.args.isExpanded;
  }

  public get isRoot() {
    return this.args.isRoot;
  }

  public get multipleSelectionEnable() {
    return this.args.multipleSelectionEnable;
  }

  public get classNames() {
    if (this.classNamesBuilder) {
      return this.classNamesBuilder('container', {
        [`$visible`]: this.isRoot || this.isExpanded
      })
    }
    return '';
  }
}

export default TreeViewPane.RegisterTemplate(layout);
