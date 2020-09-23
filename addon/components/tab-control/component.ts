import SelectItemsControl, { ISelectItemsControlArgs } from 'ember-ux-controls/common/classes/select-items-control';
import { Direction, Side, Axes, GeneratorStatus } from 'ember-ux-controls/common/types';
import { scheduleOnce } from '@ember/runloop';
import ItemContainerGenerator, { GeneratorStatusEventArgs } from 'ember-ux-controls/common/classes/-private/item-container-generator';
import { TabControlItem } from './tab-item/component';
import { computed } from '@ember/object';
import { IHeaderContentElement } from 'ember-ux-controls/common/types';
import bem, { ClassNamesBuilder } from 'ember-ux-controls/utils/bem';
import { notifyPropertyChange } from '@ember/object';
import { find } from 'ember-ux-controls/utils/dom'
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { ISelectable } from 'ember-ux-controls/common/types'

// @ts-ignore
import layout from './template';

export class TabItemModel implements ISelectable {
  public get item() {
    return this._item;
  }

  public set item(value: unknown) {
    if (this._item !== value) {
      this._item = value;
      notifyPropertyChange(this, 'item');
    }
  }

  public get header() {
    return this._header;
  }

  public set header(
    value: unknown
  ) {
    if (this._header !== value) {
      this._header = value;
      notifyPropertyChange(this, 'header');
    }
  }

  public get content() {
    return this._content;
  }

  public set content(
    value: unknown
  ) {
    if (this._content !== value) {
      this._content = value;
      notifyPropertyChange(this, 'content');
    }
  }

  public get isSelected() {
    return this._isSelected;
  }

  public set isSelected(
    value: boolean
  ) {
    if (this._isSelected != value) {
      this._isSelected = value;
      notifyPropertyChange(this, 'isSelected');
    }
  }

  private _header: unknown = null
  private _content: unknown = null
  private _item: unknown = null
  private _isSelected = false;
}

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
    args: ITabControlArgs
  ) {
    super(owner, args);

    this.itemTemplateName = 'tab-control/tab-item';

    this.eventHandler.addEventListener(
      this, GeneratorStatusEventArgs, this.onGeneratorStatusChanged
    );
  }

  @computed('side', 'direction', 'scrollable')
  public get classNamesBuilder()
    : ClassNamesBuilder {
    let
      classNamesBuilder: ClassNamesBuilder

    classNamesBuilder = bem(
      'tab-control', {
      [`$${this.side}`]: this.side !== Side.Top,
      [`$${this.direction}`]: this.direction !== Direction.Forward,
      [`$scrollable-tabs`]: this.scrollable
    });

    return classNamesBuilder;
  }

  @computed('args.{contentTemplateName}')
  public get contentTemplateName() {
    return this.args.contentTemplateName;
  }

  @computed('args.{headerTemplateName}')
  public get headerTemplateName() {
    return this.args.headerTemplateName;
  }

  @computed('args.{direction}')
  public get direction() {
    return (
      this.args.direction ??
      Direction.Forward
    );
  }

  @computed('args.{scrollable}')
  public get scrollable() {
    return (
      this.args.scrollable ??
      false
    );
  }

  @computed('args.{side}')
  public get side() {
    return (
      this.args.side ??
      Side.Top
    );
  }

  public get hasItems() {
    return this.items.count > 0;
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

  public get scrollAxis() {
    return (
      this.side === Side.Left ||
      this.side === Side.Right
    )
      ? Axes.Y
      : Axes.X;
  }

  public willDestroy() {
    this.eventHandler.removeEventListener(
      this, GeneratorStatusEventArgs, this.onGeneratorStatusChanged
    );

    super.willDestroy();
  }

  public itemItsOwnContainer(
    item: unknown
  ): item is TabControlItem {
    let
      result: boolean

    result = item instanceof TabControlItem;

    return result;
  }

  public createContainerForItem(
    _item: unknown
  )
    : TabItemModel {
    //it`s better to create new component as a container, 
    //but unfortunately it's impossible in code. This question
    //mentioned in https://github.com/emberjs/rfcs/issues/434
    return new TabItemModel();
  }

  public prepareItemContainer(
    container: TabControlItem | TabItemModel
  ): void {
    let
      item: unknown;

    item = this.readItemFromContainer(container);

    if (this.itemItsOwnContainer(item)) {
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
    _: TabItemModel | Component,
    _item: unknown
  ): void {
    
  }

  public linkContainerToItem(
    container: unknown,
    item: unknown
  ): void {
    if (
      !this.itemItsOwnContainer(item) && (
        container instanceof TabItemModel ||
        container instanceof TabControlItem
      )
    ) {
      container.item = item;
    }
  }

  public readItemFromContainer(
    container: unknown
  ): unknown {
    if (
      container instanceof TabItemModel ||
      container instanceof TabControlItem
    ) {
      return container.item;
    }
    return container;
  }

  private onGeneratorStatusChanged(
    sender: ItemContainerGenerator,
    args: GeneratorStatusEventArgs
  ): void {
    if (
      this.itemContainerGenerator === sender && 
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

function isHeaderContentElement(
  obj: unknown
): obj is IHeaderContentElement {
  return (
    typeof (<IHeaderContentElement>obj).content !== 'undefined' &&
    typeof (<IHeaderContentElement>obj).header !== 'undefined'
  );
}

export default TabControl.RegisterTemplate(layout)