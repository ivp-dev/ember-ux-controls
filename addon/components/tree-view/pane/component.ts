import Panel, { IPanelArgs } from 'ember-ux-core/components/panel';
import { ClassNamesBuilder } from 'ember-ux-core/utils/bem';
import { TreeView } from '../component';
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

  public get itemTemplateName() {
    return (
      this.args.itemTemplateName ??
      this.props?.itemTemplateName
    )
  }

  public get hasItemsSource() {
    return (
      this.args.hasItemsSource ??
      this.props?.hasItemsSource
    )
  }

  public get isExpanded() {
    return (
      this.args.isExpanded ??
      this.props?.isExpanded
    )
  }

  public get isRoot() {
    return (
      this.args.isRoot ?? 
      this.props?.isRoot
    );
  }

  public get multipleSelectionEnable() {
    return (
      this.args.multipleSelectionEnable ??
      this.props?.multipleSelectionEnable
    )
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
