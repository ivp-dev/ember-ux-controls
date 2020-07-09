import Panel, { IPanelArgs } from 'ember-ux-core/components/panel';
import { ClassNamesBuilder } from 'ember-ux-core/utils/bem';
import { TreeView } from '../component';
// @ts-ignore
import layout from './template';



interface ITreeViewPaneArgs extends IPanelArgs {
  isExpanded?: boolean,
  hasItemsSource?: boolean,
  classNamesBuilder?: ClassNamesBuilder
  headerTemplateName?: string
  expanderTemplateName?: string
}

export class TreeViewPane extends Panel<ITreeViewPaneArgs> {
  constructor(
    owner: any,
    args: ITreeViewPaneArgs,
    props?: ITreeViewPaneArgs
  ) {
    super(owner, args, props);
  }

  public get classNamesBuilder() {
    return (
      this.args.classNamesBuilder ??
      this.props?.classNamesBuilder
    )
  }

  public get expanderTemplateName() {
    return (
      this.args.expanderTemplateName ??
      this.props?.expanderTemplateName
    )
  }

  public get headerTemplateName() {
    return (
      this.args.headerTemplateName ??
      this.props?.headerTemplateName
    )
  }

  public get hasItemsSource() {
    return (
      this.args.hasItemsSource ??
      this.props?.hasItemsSource
    )
  }

  public get isExpanded() {
    this.hasItemsSource
    return (
      this.args.isExpanded ??
      this.props?.isExpanded
    )
  }

  public get isRoot() {
    return this.parentTreeView && this.parentTreeView.isRoot;
  }

  public get classNames() {
    if (this.classNamesBuilder) {
      return this.classNamesBuilder('container', {
        [`$visible`]: this.isRoot || this.isExpanded
      })
    }
    return '';
  }

  public get parentTreeView()
    : TreeView | null {
    if (this.parentItemsControl instanceof TreeView) {
      return this.parentItemsControl;
    }

    return null;
  }
}

export default TreeViewPane.RegisterTemplate(layout);
