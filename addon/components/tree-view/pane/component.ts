import Panel, { IPanelArgs } from 'ember-ux-core/components/panel';
import { ClassNamesBuilder } from 'ember-ux-core/utils/bem';
import { computed } from '@ember/object';
// @ts-ignore
import layout from './template';
import { TreeView } from '../component';


interface ITreeViewPaneArgs extends IPanelArgs {
  isExpanded?: boolean,
  hasItemsSource?: boolean,
  classNamesBuilder?: ClassNamesBuilder
}

export class TabPane extends Panel<ITreeViewPaneArgs> {
  constructor(
    owner: any,
    args: ITreeViewPaneArgs,
    props?: ITreeViewPaneArgs
  ) {
    super(owner, args, props);
  }

  public get classNamesBuilder() {
    if (this.parentTreeView) {
      return this.parentTreeView.classNamesBuilder;
    }

    return (
      this.args.classNamesBuilder ??
      this.props?.classNamesBuilder
    )
  }

  public get hasItemsSource() {
    if (this.parentTreeView) {
      return this.parentTreeView.hasItemsSource;
    }

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

  protected get parentTreeView()
    : TreeView | null {
    if (this.parentItemsControl instanceof TreeView) {
      return this.parentItemsControl;
    }

    return null;
  }
}

export default TabPane.RegisterTemplate(layout);
