import Component from '@glimmer/component';
import NativeArray from "@ember/array/-private/native-array";
import { computed } from '@ember/object';
import ItemContainerGenerator from 'ember-ux-controls/common/classes/-private/item-container-generator';
import ItemCollection, { ItemCollectionChangedEventArgs } from 'ember-ux-controls/common/classes/-private/item-collection';
import ItemInfo, { CONTAINERS } from 'ember-ux-controls/common/classes/-private/item-info';
import equals from 'ember-ux-controls/utils/equals';
import { isArray } from '@ember/array';
import { isEmpty } from '@ember/utils';
import { DeferredAction, IGeneratorHost } from 'ember-ux-controls/common/types';
import UXElement, { IUXElementArgs } from './ux-element';
import { addObserver, removeObserver } from '@ember/object/observers';
import { notifyPropertyChange } from '@ember/object';

export interface IItemsControlArgs extends IUXElementArgs {
  itemsSource?: NativeArray<unknown>
  itemTemplateName?: string,
  onItemsChanged?: (source: ItemCollection, oldItems: Array<unknown>, newItems: Array<unknown>) => void
}

/**
 * The base class for the controls that have children.
 */
export default abstract class ItemsControl<TA extends IItemsControlArgs = {}>
  extends UXElement<TA>
  implements IGeneratorHost {

  constructor(
    owner: any,
    args: TA
  ) {
    super(owner, args);

    this.addChild = this.addChild.bind(this);
    this.removeChild = this.removeChild.bind(this);
    this.subscribeItemsSourceChanged();

    this._hasItemsSource = isArray(this.itemsSource);
  }

  @computed('args.{itemTemplateName}')
  public get itemTemplateName() {
    return this.args.itemTemplateName;
  }

  @computed('args.{itemsSource}')
  public get itemsSource() {
    return this.args.itemsSource;
  }

  @computed('itemTemplateName')
  public get hasItemTemplate() {
    return !isEmpty(
      this.itemTemplateName
    );
  }

  private subscribeItemsSourceChanged() {
    let
      itemsSource: keyof this;

    itemsSource = 'itemsSource';

    addObserver(
      this,
      itemsSource,
      this.onItemsSourceChanged
    );
  }

  public get hasItemsSource() {
    return this._hasItemsSource;
  }

  public set hasItemsSource(
    value: boolean
  ) {
    if (this._hasItemsSource !== value) {
      this._hasItemsSource = value;
      notifyPropertyChange(this, 'hasItemsSource');
    }
  }

  public get items() {
    if (!this._items) {
      this._items = ItemCollection.Create(this);

      if (!this._itemsContainerGenerator) {
        this._itemsContainerGenerator = new ItemContainerGenerator(this);
      }

      this._items.addEventListener(
        this,
        ItemCollectionChangedEventArgs,
        this.onItemCollectionChanged
      );
    }

    return this._items;
  }

  public get view() {
    return this.items;
  }

  public get itemContainerGenerator() {
    if (!this._itemsContainerGenerator) {

      if (!this._items) {
        this._items = ItemCollection.Create(this);
      }

      this._itemsContainerGenerator = new ItemContainerGenerator(this);

      this._items.addEventListener(
        this,
        ItemCollectionChangedEventArgs,
        this.onItemCollectionChanged
      );
    }

    return this._itemsContainerGenerator!;
  }

  public abstract createContainerForItem(item: unknown): unknown;

  public abstract prepareItemContainer(container: unknown): void;

  public abstract clearContainerForItem(container: unknown, item: unknown): void;

  public abstract linkContainerToItem(container: unknown, item: unknown): void;

  public abstract readItemFromContainer(container: unknown): unknown;

  public addChild(child: object, isDeferred: boolean = false)
    : void {
    if (isDeferred && !this.items.isDeferred) {
      this.items.deferNext(DeferredAction.Push);
    }

    this.items.pushObject(child);
  }

  public removeChild(child: object, isDeferred: boolean = false)
    : void {
    if (isDeferred && !this.items.isDeferred) {
      this.items.deferNext(DeferredAction.Remove);
    }

    this.items.removeObject(child);
  }

  public containerForItem(item: unknown) {
    if (this.itemItsOwnContainer(item)) {
      return item;
    }
    return this.createContainerForItem(item);
  }

  public itemItsOwnContainer(item: unknown): boolean {
    return item instanceof Component;
  }

  public willDestroy() {
    let
      hasItemsSource: keyof this;

    super.willDestroy();

    if (this._items) {
      this._items.removeEventListener(
        this,
        ItemCollectionChangedEventArgs,
        this.onItemCollectionChanged
      );
    }

    if (this._itemsContainerGenerator) {
      this._itemsContainerGenerator.dispose();
      this._itemsContainerGenerator = void 0;
    }

    hasItemsSource = 'itemsSource';

    removeObserver(
      this,
      hasItemsSource,
      this.onItemsSourceChanged
    );
  }

  public static Equals(
    left: unknown,
    right: unknown
  ) {
    return equals(left, right);
  }

  protected onItemCollectionChanged(
    sender: ItemCollection,
    args: ItemCollectionChangedEventArgs
  ): void {
    if (typeof this.args.onItemsChanged === 'function') {
      this.args.onItemsChanged(sender, args.oldItems, args.newItems);
    }
  }

  protected createInfo(
    container: unknown,
    item: unknown,
    index: number = -1
  ) {
    return new ItemInfo(index, item, container).refresh(
      this.itemContainerGenerator
    );
  }

  protected createUnresolvedInfo(item: unknown) {
    return new ItemInfo(-1, item, CONTAINERS.UNRESOLVED);
  }

  protected adjustItemInfosAfterGeneratorChange(
    infos: ItemInfo[],
    claimUniqueContainer: unknown
  ) {
    let
      resolvePendingContainers: boolean = false,
      container: unknown,
      claimedContainers: unknown[],
      index: number,
      /*findResult: boolean,
      item: unknown,*/
      info: ItemInfo;

    for (info of infos) {
      container = info.container;
      if (container === null) {
        resolvePendingContainers = true;
      } else if (
        info.isRemoved ||
        !ItemsControl.Equals(
          this.readItemFromContainer(container),
          info.item
        )
      ) {
        info.container = null;
        resolvePendingContainers = true;
      }
    }

    if (!resolvePendingContainers) {
      return;
    }

    claimedContainers = [];

    if (claimUniqueContainer) {
      claimedContainers = claimedContainers.concat(infos.filter(info =>
        info.container !== null)
      );
    }

    for (info of infos) {
      container = info.container;

      if (container !== null) {
        continue;
      }

      index = info.index;
      if (index >= 0) {
        container = this.itemContainerGenerator.containerFromIndex(index);
      } else {
        [
          /*findResult*/,
          container,
          /*item*/,
          index
        ] = this.itemContainerGenerator.findItem(
          (innerItem: unknown, innerContainer: object) => (
            ItemsControl.Equals(innerItem, info.item) &&
            !claimedContainers.some(claimed => claimed === innerContainer)
          )
        );
      }

      if (container !== null) {
        info.container = container;
        info.index = index;
        if (claimUniqueContainer) {
          claimedContainers.push(container)
        }
      }
    }
  }

  private onItemsSourceChanged() {
    //First we need update current state
    this.items.source = this.itemsSource;
    //Only after that we can update property
    this.hasItemsSource = isArray(this.itemsSource);
    //Notify listeners
    notifyPropertyChange(this, 'hasItemsSource');
  }

  private _hasItemsSource: boolean
  private _items?: ItemCollection
  private _itemsContainerGenerator?: ItemContainerGenerator
}