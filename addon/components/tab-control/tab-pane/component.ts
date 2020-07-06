import Panel, { IPanelArgs } from 'ember-ux-core/components/panel';
import { Axes } from 'ember-ux-core/common/types';
import { ClassNamesBuilder } from 'ember-ux-core/utils/bem';
import { TabControl } from '../component';
// @ts-ignore
import layout from './template';


interface ITabPaneArgs extends IPanelArgs {
  scrollable?: boolean
  scrollAxis?: Axes
  classNamesBuilder?: ClassNamesBuilder
}

export class TabPane extends Panel<ITabPaneArgs> {
  constructor(
    owner: any,
    args: ITabPaneArgs,
    props?: ITabPaneArgs
  ) {
    super(owner, args, props);
  }

  public get classNamesBuilder()
    : ClassNamesBuilder | undefined {
    if (this.parentTabControl) {
      return this.parentTabControl.classNamesBuilder;
    }

    return (
      this.args.classNamesBuilder ??
      this.props?.classNamesBuilder
    );
  }

  public get scrollPortClassNames()
    : string {
    if (this.classNamesBuilder) {
      return `${this.classNamesBuilder('tabs-scroll-port')}`;
    }

    return '';
  }

  public get classNames()
    : string {
    if (this.classNamesBuilder) {
      return `${this.classNamesBuilder('tabs')}`;
    }
    return '';
  }

  public get scrollable()
    : boolean | undefined {
    if (this.parentTabControl) {
      return this.parentTabControl.scrollable;
    }

    return (
      this.args?.scrollable ||
      this.props?.scrollable
    );
  }

  public get scrollAxis()
    : Axes | undefined {
    if (this.parentTabControl) {
      return this.parentTabControl.scrollAxis;
    }

    return (
      this.args.scrollAxis ??
      this.props?.scrollAxis
    );
  }

  public get parentTabControl()
    : TabControl | null {
    if (this.parentItemsControl instanceof TabControl) {
      return this.parentItemsControl;
    }

    return null;
  }
}

export default TabPane.RegisterTemplate(layout);
