import SelectItemsControl, { ISelectItemsControlArgs } from 'ember-ux-core/components/select-items-control';
import { Direction, Side, Axes, GeneratorStatus } from 'ember-ux-core/common/types';
import { scheduleOnce } from '@ember/runloop';
import { GeneratorStatusEventArgs } from 'ember-ux-core/common/classes/-private/item-container-generator';
import { TabItem } from './tab-item/component';
import Tab from 'ember-ux-controls/common/classes/tab';
import { computed } from '@ember/object';
import { IHeaderContentElement } from 'ember-ux-controls/common/types';
import bem, { ClassNamesBuilder } from 'ember-ux-core/utils/bem';
import { notifyPropertyChange } from '@ember/object';
import { find } from 'ember-ux-core/utils/dom'
import { action } from '@ember/object';
// @ts-ignore
import layout from './template';

export interface ITabControlArgs extends ISelectItemsControlArgs {
  direction?: Direction,
  scrollable?: boolean,
  side?: Side,
  getHeader?: (item: unknown) => unknown
  getContent?: (item: unknown) => unknown
  contentTemplateName?: string
  headerTemplateName?: string
}

export class TabControl extends SelectItemsControl<ITabControlArgs> {
  public html: HTMLElement | null = null

  constructor(
    owner: unknown,
    args: ITabControlArgs,
    props?: ITabControlArgs
  ) {
    super(owner, args, props);

    this.itemContainerGenerator.eventHandler.addEventListener(
      this, GeneratorStatusEventArgs, this.onGeneratorStatusChanged
    )
  }

  @computed('side', 'direction', 'scrollable')
  public get classNamesBuilder()
    : ClassNamesBuilder {
    let
      classNamesBuilder = bem(
        'tab-control', {
        [`$${this.side}`]: this.side !== Side.Top,
        [`$${this.direction}`]: this.direction !== Direction.Forward,
        [`$scrollable-tabs`]: this.scrollable
      });

    return classNamesBuilder;
  }

  public get contentPresenter() {
    return this._contentPresenter;
  }

  public set contentPresenter(value: Element | null) {
    if (this._contentPresenter !== value) {
      this._contentPresenter = value;
      notifyPropertyChange(this, 'contentPresenter')
    }
  }

  public get classNames() {
    return `${this.classNamesBuilder}`;
  }

  public get contentClassNames() {
    return `${this.classNamesBuilder('content')}`;
  }

  public get itemTemplateName() {
    return (
      super.itemTemplateName ?? 
      'tab-control/tab-item'
    );
  }

  public get contentTemplateName() {
    return (
      this.args.contentTemplateName ??
      this.props?.contentTemplateName ??
      'tab-control/content'
    );
  }

  public get headerTemplateName() {
    return (
      this.args.headerTemplateName ??
      this.props?.headerTemplateName ??
      'tab-control/header'
    );
  }

  public get direction() {
    return (
      this.args.direction ??
      this.props?.direction ??
      Direction.Forward
    );
  }

  public get scrollable() {
    return (
      this.args.scrollable ??
      this.props?.scrollable ??
      false
    );
  }

  public get side() {
    return (
      this.args.side ??
      this.props?.side ??
      Side.Top
    );
  }

  public get scrollAxis() {
    return (
      this.side === Side.Left ||
      this.side === Side.Right
    )
      ? Axes.Y
      : Axes.X;
  }

  public itemItsOwnContainer(
    item: unknown
  ): item is TabItem {
    let
      result: boolean

    result = item instanceof TabItem;

    return result;
  }

  public createContainerForItem()
    : Tab {
    return new Tab(this);
  }

  public prepareItemContainer(
    container: unknown
  ): void {
    let
      item: unknown;

    item = this.readItemFromContainer(container)

    if (this.itemItsOwnContainer(item)) {
      return;
    }

    if (!isTab(container)) {
      return;
    }

    if (isHeaderContentElement(item)) {
      container.content = item.content;
      container.header = item.header
    } else if (
      typeof this.args.getHeader === 'function' &&
      typeof this.args.getContent === 'function'
    ) {
      container.header = this.args.getHeader(item);
      container.content = this.args.getContent(item)
    } else {
      throw new Error(`Can't extract header and content from item`);
    }
  }

  public clearContainerForItem(
    container: Tab
    /*item: unknown*/
  ): void {
    container.item = null;
    container.content = null;
    container.header = null;
  }

  public linkContainerToItem(
    container: unknown,
    item: unknown
  ): void {
    if (!this.itemItsOwnContainer(item) && isTab(container)) {
      container.item = item;
    }
  }

  public readItemFromContainer(
    container: unknown
  ): unknown {
    if (isTab(container)) {
      return container.item;
    }
    return container;
  }

  private onGeneratorStatusChanged(
    args: GeneratorStatusEventArgs
  ): void {
    if (
      args.newStatus === GeneratorStatus.ContainersGenerated
    ) {
      if (
        this.items.count > 0 &&
        this.selectedItems.count === 0
      ) {
        scheduleOnce('afterRender', this, () => {
          this.selectedIndex = 0
        });
      }
    }
  }

  @action
  public didInsert(
    html: HTMLElement
  ) {
    this.contentPresenter = find(
      html,
      `.${this.classNamesBuilder('content').toString(driver =>
        driver.base
      )}`
    )[0];

    if (!this.contentPresenter) {
      throw new Error('TabControl.Content was not found');
    }
  }

  private _contentPresenter: Element | null = null;
}

export function parentIsTabControl(parentElement: unknown): parentElement is TabControl {
  return parentElement instanceof TabControl
}

function isHeaderContentElement(
  obj: unknown
): obj is IHeaderContentElement {
  return (
    typeof (<IHeaderContentElement>obj).content !== 'undefined' &&
    typeof (<IHeaderContentElement>obj).header !== 'undefined'
  );
}

function isTab(
  obj: unknown
): obj is Tab {
  return (
    obj instanceof Tab
  );
}

export default TabControl.RegisterTemplate(layout)