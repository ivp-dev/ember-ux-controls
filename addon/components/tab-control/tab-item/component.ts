import UXElement, { IUXElementArgs } from 'ember-ux-core/components/ux-element';
import { action } from '@ember/object';
import { on, off, appendBetween } from 'ember-ux-core/utils/dom';
import { scheduleOnce } from '@ember/runloop';
import { TabControl } from '../component';
import { TabPane } from '../tab-pane/component';
import Tab from 'ember-ux-controls/common/classes/tab';
import { notifyPropertyChange } from '@ember/object';
import { computed } from '@ember/object';
import { ClassNamesBuilder } from 'ember-ux-core/utils/bem';
// @ts-ignore
import layout from './template';



interface ITabItemArgs extends IUXElementArgs {
  tab?: Tab
  header?: unknown,
  content?: unknown,
  contentTemplateName?: string
  headerTemplateName?: string
  classNamesBuilder?: ClassNamesBuilder
}

export class TabItem extends UXElement<ITabItemArgs> {
  constructor(
    owner: any,
    args: ITabItemArgs
  ) {
    super(owner, args);

    this._openNode = document.createTextNode('');
    this._closeNode = document.createTextNode('');
  }

  public get headerTemplateName()
    : string | undefined {
    if (this.parentTabControl) {
      return this.parentTabControl.headerTemplateName;
    }

    return this.args.headerTemplateName;
  }

  public get contentTemplateName()
    : string | undefined {
    if (this.parentTabControl) {
      return this.parentTabControl.contentTemplateName;
    }

    return this.args.contentTemplateName;
  }

  public get classNamesBuilder()
    : ClassNamesBuilder | undefined {
    if (this.parentTabControl) {
      return this.parentTabControl.classNamesBuilder;
    }

    return this.args.classNamesBuilder;
  }

  public get hasItemsSource()
    : boolean {
    return (
      this.parentTabControl !== null &&
      this.parentTabControl.hasItemsSource
    );
  }

  @computed('args.tab.isSelected')
  public get isSelected()
    : boolean {
    return this.args.tab?.isSelected ?? this._isSelected;
  }

  public set isSelected(value: boolean) {
    if (this._isSelected !== value) {
      this._isSelected = value;
      notifyPropertyChange(this, 'isSelected');
    }
  }

  public get header()
    : unknown {
    return (
      this.args.tab?.header ??
      this.args.header
    );
  }

  public get content()
    : unknown {
    return (
      this.args.tab?.content ??
      this.args.content
    );
  }

  public get item()
    : unknown | this {
    return (
      this.args.tab?.item ??
      this
    );
  }

  public get classNames()
    : string {
    let
      classNames: string;

    classNames = '';

    if (this.parentTabControl) {
      classNames = `${this.parentTabControl.classNamesBuilder('tab', {
        '$active': this.isSelected
      })}`;
    }

    return classNames;
  }

  public get openNode()
    : Node {
    return this._openNode;
  }

  public get closeNode()
    : Node {
    return this._closeNode;
  }

  protected get parentTabControl()
    : TabControl | null {
    if (this.parentElement instanceof TabControl) {
      return this.parentElement;
    }

    if (this.parentElement instanceof TabPane) {
      return this.parentElement.parentTabControl;
    }

    return null;
  }

  protected get container()
    : Tab | this {
    return this.args.tab ?? this;
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
      owner: TabControl | null = this.parentTabControl;

    on(element, 'click', this.onTabClick);

    if (
      owner !== null &&
      !owner.hasItemsSource
    ) {
      scheduleOnce('afterRender', this, () => {
        owner.addChild(this);
      })
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
      this.parentTabControl &&
      !this.isSelected
    ) {
      this.parentTabControl.onSelect(this.container);
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
      this.parentTabControl &&
      this.parentTabControl.contentPresenter
    ) {
      appendBetween(
        this.parentTabControl.contentPresenter,
        this.openNode,
        this.closeNode,
        true
      );
    }
  }

  private _openNode: Node
  private _closeNode: Node
  private _html: HTMLElement | null = null;
  private _isSelected: boolean = false;
}

export default TabItem.RegisterTemplate(layout);