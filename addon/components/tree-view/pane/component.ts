import Panel, { IPanelArgs } from 'ember-ux-core/components/panel';
import { ClassNamesBuilder } from 'ember-ux-core/utils/bem';
import { TreeView } from 'ember-ux-controls/components/tree-view/component';
// @ts-ignore
import layout from './template';

interface ITreeViewPaneArgs extends IPanelArgs {
  isExpanded?: boolean,
  hasItemsSource?: boolean,
  itemTemplateName?: string
  titleTemplateName?: string
  headerTemplateName?: string
  expanderTemplateName?: string
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

  public get isRoot() {
    return this.visualParent instanceof TreeView
  }

  public get isExpanded() {
    return this.args.isExpanded;
  }

  public get classNamesBuilder() {
    return this.args.classNamesBuilder
  }

  public get itemTemplateName() {
    return this.args.itemTemplateName;
  }

  public get headerTemplateName() {
    return this.args.headerTemplateName;
  }

  public get expanderTemplateName() {
    return this.args.expanderTemplateName;
  }

  public get titleTemplateName() {
    return this.args.titleTemplateName;
  }

  public get hasItemsSource() {
    return this.args.hasItemsSource;
  }

  public get multipleSelectionEnable() {
    return this.args.multipleSelectionEnable;
  }

  public get classNames()
    : string {
    if (this.classNamesBuilder) {
      return `${this.classNamesBuilder('container', {
        [`$visible`]: this.isRoot || this.isExpanded
      })}`
    }
    return '';
  }
}

export default TreeViewPane.RegisterTemplate(layout);
