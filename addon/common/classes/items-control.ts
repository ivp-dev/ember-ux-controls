import Component from '@glimmer/component';
import NativeArray from "@ember/array/-private/native-array";
import { computed } from '@ember/object';
import ItemContainerGenerator from 'ember-ux-controls/common/classes/-private/item-container-generator';
import ItemCollection from 'ember-ux-controls/common/classes/-private/item-collection';
import ItemInfo, { CONTAINERS } from 'ember-ux-controls/common/classes/-private/item-info';
import { ArrayChangedEventArgs } from 'ember-ux-controls/common/classes/-private/observable-proxy-array';
import equals from 'ember-ux-controls/utils/equals';
import { notifyPropertyChange } from '@ember/object';
import { isArray } from '@ember/array';
import { isEmpty } from '@ember/utils';

import {
  IArrayObserver,
  IGeneratorHost
} from 'ember-ux-controls/common/types';
import UXElement, { IUXElementArgs } from './ux-element';

import Panel from './panel';

export interface IItemsControlArgs extends IUXElementArgs {
  itemsSource?: NativeArray<unknown>
  itemTemplateName?: string,
  onItemsChanged?: (sender: ItemCollection, args: ArrayChangedEventArgs<unknown>) => void
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
  }

  @computed('args.{itemTemplateName}')
  public get itemTemplateName() {
    return (
      this.args.itemTemplateName ??
      this._itemTemplateName
    );
  }

  public set itemTemplateName(
    value: string | null
  ) {
    if (this._itemTemplateName !== value) {
      this._itemTemplateName = value;
      notifyPropertyChange(this, 'itemTemplateName');
    }
  }

  @computed('args.{itemsSource}')
  public get itemsSource() {
    return (
      this.args.itemsSource ??
      this._itemsSource
    );
  }

  public set itemsSource(
    value: NativeArray<unknown> | null
  ) {
    if (this._itemsSource !== value) {
      this._itemsSource = value;
      notifyPropertyChange(this, 'itemsSource');
    }
  }

  @computed('itemsSource')
  public get hasItemsSource()
    : boolean {
    return isArray(this.itemsSource);
  }

  @computed('itemTemplateName')
  public get hasItemTemplate() {
    return !isEmpty(
      this.itemTemplateName
    );
  }

  public get items() {
    if (!this._items) {
      this._items = this.createItemCollection();
    }

    return this._items;
  }

  public get view() {
    return this.items;
  }

  public get itemContainerGenerator() {
    if (!this._itemsContainerGenerator) {
      this._itemsContainerGenerator = this.createItemContainerGenerator();
    }

    return this._itemsContainerGenerator!;
  }

  public get itemsHost() {
    return this._itemsHost;
  }

  public set itemsHost(value: Panel | null) {
    if (this._itemsHost !== value) {
      this._itemsHost = value;
      notifyPropertyChange(this, 'itemsHost');
    }
  }

  public addChild(child: object) {
    this.items.pushObject(child);
  }

  // IGeneratorHost implementation

  public containerForItem(item: unknown) {
    if (this.itemItsOwnContainer(item)) {
      return item;
    }
    return this.createContainerForItem(item);
  }

  public itemItsOwnContainer(item: unknown): boolean {
    return item instanceof Component;
  }

  public abstract createContainerForItem(item: unknown): unknown;

  public abstract prepareItemContainer(container: unknown): void;

  public abstract clearContainerForItem(container: unknown, item: unknown): void;

  public abstract linkContainerToItem(container: unknown, item: unknown): void;

  public abstract readItemFromContainer(container: unknown): unknown;

  // IGeneratorHost implementation end

  public willDestroy() {
    if (this.isDestroyed) {
      if (this.items && this._itemsObsever) {
        this.items.eventHandler.removeEventListener(this, ArrayChangedEventArgs)
      }
    }

    super.willDestroy();
  }

  public static Equals(
    left: unknown,
    right: unknown
  ) {
    return equals(left, right);
  }

  protected onItemCollectionChanged(
    sender: ItemCollection,
    args: ArrayChangedEventArgs<unknown>
  ): void {
    if (typeof this.args.onItemsChanged === 'function') {
      this.args.onItemsChanged(sender, args);
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
        [/*findResult*/, container, /*item*/, index] = this.itemContainerGenerator.findItem(
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

  private createItemCollection()
    : ItemCollection {
    let
      items: ItemCollection;

    items = ItemCollection.create({
      host: this
    });

    items.eventHandler.addEventListener(
      this, ArrayChangedEventArgs, this.onItemCollectionChanged
    );

    return items;
  }

  private createItemContainerGenerator() {
    return new ItemContainerGenerator(this);
  }

  private _itemTemplateName: string | null = null
  private _itemsSource: NativeArray<unknown> | null = null
  private _itemsHost: Panel | null = null
  private _items: ItemCollection | null = null
  private _itemsObsever: IArrayObserver<any> | null = null
  private _itemsContainerGenerator: ItemContainerGenerator | null = null
}