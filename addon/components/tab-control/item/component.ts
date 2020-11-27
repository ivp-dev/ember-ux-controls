// @ts-ignore
import layout from './template';
import UXElement, { IUXElementArgs } from 'ember-ux-controls/common/classes/ux-element';
import { action } from '@ember/object';
import { on, off } from 'ember-ux-controls/utils/dom';
import { TabItemModel } from 'ember-ux-controls/components/tab-control/component';
import { notifyPropertyChange } from '@ember/object';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import preventNativeEvent from 'ember-ux-controls/utils/prevent-native-event';
import { notEmpty } from '@ember/object/computed';

interface ITabControlItemArgs extends IUXElementArgs {
  item?: unknown,
  header?: unknown,
  content?: unknown,
  isSelected?: boolean
  hasItemsSource?: boolean
  container?: TabItemModel,
  contentPresenter?: Element
  contentTemplateName?: string
  headerTemplateName?: string
  onSelect?: (container: unknown) => void
  onUnselect?: (container: unknown) => void
  addChild?: (child: unknown) => void
  removeChild?: (child: unknown) => void
}

export class TabControlItem extends UXElement<ITabControlItemArgs> {
  constructor(
    owner: any,
    args: ITabControlItemArgs
  ) {
    super(owner, args);
  }

  @reads('args.headerTemplateName')
  public headerTemplateName?: string

  @notEmpty('headerTemplateName')
  public hasHeaderTemplate?: boolean

  @reads('args.contentTemplateName')
  public contentTemplateName?: string

  @notEmpty('contentTemplateName')
  public hasContentTemplate?: boolean
  
  @reads('args.hasItemsSource')
  public hasItemsSource?: boolean

  @reads('args.contentPresenter')
  public contentPresenter?: Element

  @reads('args.onSelect')
  public onSelect?: (container: unknown) => void

  @reads('args.onUnselect')
  public onUnselect?: (container: unknown) => void

  @reads('args.addChild')
  public addChild?: (child: unknown) => void

  @reads('args.removeChild')
  public removeChild?: (child: unknown) => void

  @computed('args.{container}')
  public get container()
    : TabItemModel | this {
    return this.args.container ?? this;
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

  protected get html()
    : HTMLElement | undefined {
    return this._html;
  }

  protected set html(
    value: HTMLElement | undefined
  ) {
    if (this._html !== value) {
      this._html = value;
    }
  }

  @action
  public didInsert(
    element: HTMLElement
  ): void {
    on(element, 'click', this.onTabClick);
    
    if (
      this.hasItemsSource === false &&
      typeof this.addChild === 'function'
    ) {
      this.addChild(this);
    }
    
    this.html = element;
  }

  @action
  public onTabClick(
    event: MouseEvent | TouchEvent
  ): void {
    if (
      typeof this.onSelect === "function" &&
      this.isSelected === false
    ) {
      this.onSelect(this.container);
    }

    preventNativeEvent(event);
  }

  public willDestroy()
    : void {
    if (this.isDestroyed) {
      return;
    }

    if (this.html) {
      off(this.html, 'click', this.onTabClick);
      this.html = void 0;
    }

    if (
      this.hasItemsSource === false &&
      typeof this.removeChild === 'function'
    ) {
      this.removeChild(this);
    }

    super.willDestroy();

    //TODO: maybe I need to remove it from TabControl.Items here
  }

  private _item: unknown
  private _content: unknown
  private _header: unknown
  private _html?: HTMLElement;
  private _isSelected: boolean = false;
}

export default TabControlItem.RegisterTemplate(layout);