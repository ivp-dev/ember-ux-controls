import UXElement, { IUXElementArgs } from 'ember-ux-controls/common/classes/ux-element';
import { action } from '@ember/object';
import { on, off, appendBetween } from 'ember-ux-controls/utils/dom';
import { scheduleOnce } from '@ember/runloop';
import { TabControl } from '../component';
import TabItemModel from 'ember-ux-controls/common/classes/tab-item-model';
import { notifyPropertyChange } from '@ember/object';
import { computed } from '@ember/object';
import { ClassNamesBuilder } from 'ember-ux-controls/utils/bem';
import { next } from '@ember/runloop';
// @ts-ignore
import layout from './template';

interface ITabControlItemArgs extends IUXElementArgs {
  container?: TabItemModel,
  isSelected?: boolean
  item?: unknown,
  header?: unknown,
  content?: unknown,
  hasItemsSource?: boolean
  contentTemplateName?: string
  headerTemplateName?: string
  classNamesBuilder?: ClassNamesBuilder
}

export class TabControlItem extends UXElement<ITabControlItemArgs> {
  constructor(
    owner: any,
    args: ITabControlItemArgs
  ) {
    super(owner, args);

    this._openNode = document.createTextNode('');
    this._closeNode = document.createTextNode('');
  }

  @computed('args.{container}')
  public get container()
    : TabItemModel | this {
    return this.args.container ?? this;
  }


  @computed('args.{headerTemplateName}')
  public get headerTemplateName()
    : string | undefined {
    return this.args.headerTemplateName;
  }

  @computed('args.{contentTemplateName}')
  public get contentTemplateName()
    : string | undefined {
    return this.args.contentTemplateName;
  }

  @computed('args.{classNamesBuilder}')
  public get classNamesBuilder()
    : ClassNamesBuilder | undefined {
    return this.args.classNamesBuilder;
  }

  @computed('args.{hasItemsSource}')
  public get hasItemsSource()
    : boolean | undefined {
    return this.args.hasItemsSource;
  }

  @computed('args.{header}')
  public get header()
    : unknown {
    return (
      this._header ??
      this.args.header
    );
  }

  public set header(
    value: unknown
  ) {
    if (this.header !== value) {
      this._header = value;
      notifyPropertyChange(this, 'header')
    }
  }

  @computed('args.{content}')
  public get content()
    : unknown {
    return (
      this._content ??
      this.args.content
    );
  }

  public set content(
    value: unknown
  ) {
    if (this.content !== value) {
      this._content = value;
      notifyPropertyChange(this, 'content')
    }
  }

  @computed('args.{item}')
  public get item()
    : unknown | this {
    return (
      this._item ?? this
    );
  }

  public set item(
    value: unknown
  ) {
    if (this._item !== value) {
      this._item = value;
      notifyPropertyChange(this, 'item');
    }
  }

  @computed('args.{isSelected}')
  public get isSelected()
    : boolean {
    return (
      this.args.isSelected ??
      this._isSelected
    );
  }

  public set isSelected(value: boolean) {
    if (this._isSelected !== value) {
      this._isSelected = value;
      notifyPropertyChange(this, 'isSelected');
    }
  }

  public get classNames()
    : string {
    if (this.classNamesBuilder) {
      return `${this.classNamesBuilder('tab', {
        '$active': this.isSelected
      })}`;
    }
    return '';
  }

  public get openNode()
    : Node {
    return this._openNode;
  }

  public get closeNode()
    : Node {
    return this._closeNode;
  }

  protected get html()
    : HTMLElement | null {
    return this._html;
  }

  protected set html(
    value: HTMLElement | null
  ) {
    if (this._html !== value) {
      this._html = value;
    }
  }

  @action
  public didInsert(
    element: HTMLElement
  ): void {
    const
      parent = this.logicalParent;

    on(element, 'click', this.onTabClick);

    if (
      parent instanceof TabControl &&
      !parent.hasItemsSource
    ) {
      next(this, () => {
        parent.addChild(this);
      });
    }

    this.html = element;
  }

  @action
  public onSelectionChanged()
    : void {
    if (this.isSelected) {
      scheduleOnce('afterRender', this, this.updateContentPresenter);
    }
  }

  @action
  public onTabClick(
    event: MouseEvent | TouchEvent
  ): void {
    if (
      this.logicalParent instanceof TabControl &&
      !this.isSelected
    ) {
      this.logicalParent.onSelect(this.container);
    }
    event.preventDefault();
  }

  public willDestroy()
    : void {
    if (this.isDestroyed) {
      return;
    }

    if (this.html) {
      off(this.html, 'click', this.onTabClick);
      this.html = null;
    }

    //TODO: maybe I need to remove it from TabControl.Items here
  }

  private updateContentPresenter() {
    if (
      this.logicalParent instanceof TabControl &&
      this.logicalParent.contentPresenter
    ) {
      appendBetween(
        this.logicalParent.contentPresenter,
        this.openNode,
        this.closeNode,
        true
      );
    }
  }

  private _item: unknown
  private _content: unknown
  private _header: unknown
  private _openNode: Node
  private _closeNode: Node
  private _html: HTMLElement | null = null;
  private _isSelected: boolean = false;
}

export default TabControlItem.RegisterTemplate(layout);