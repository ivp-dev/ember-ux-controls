import Panel, { IPanelArgs } from 'ember-ux-core/components/panel';
import { Axes } from 'ember-ux-core/common/types';
import { ClassNamesBuilder } from 'ember-ux-core/utils/bem';
import { computed } from '@ember/object';
// @ts-ignore
import layout from './template';


interface ITabPaneArgs extends IPanelArgs {
  scrollable?: boolean
  scrollAxis?: Axes
  hasItemsSource?: boolean
  itemTemplateName?: string
  headerTemplateName?: string
  contentTemplateName?: string
  classNamesBuilder?: ClassNamesBuilder
}

export class TabPane extends Panel<ITabPaneArgs> {
  constructor(
    owner: any,
    args: ITabPaneArgs
  ) {
    super(owner, args);
  }

  @computed('args.{itemTemplateName}')
  public get itemTemplateName()
    : string | undefined {
    return this.args.itemTemplateName;
  }

  @computed('args.{headerTemplateName}')
  public get headerTemplateName()
    : string | undefined {
    return  this.args.headerTemplateName;
  }

  @computed('args.{contentTemplateName}')
  public get contentTemplateName()
    : string | undefined {
    return this.args.contentTemplateName;
  }

  @computed('args.{scrollable}')
  public get scrollable()
    : boolean | undefined {
    return this.args.scrollable;
  }

  @computed('args.{hasItemsSource}')
  public get hasItemsSource()
    : boolean | undefined {
    return this.args.hasItemsSource;
  }

  @computed('args.{scrollAxis}')
  public get scrollAxis()
    : Axes | undefined {
    return this.args.scrollAxis;
  }

  @computed('args.{classNamesBuilder}')
  public get classNamesBuilder()
    : ClassNamesBuilder | undefined {
    return this.args.classNamesBuilder;
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
}

export default TabPane.RegisterTemplate(layout);
