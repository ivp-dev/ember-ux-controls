
import { IItemsControlArgs } from './items-control';
import { addObserver, removeObserver } from '@ember/object/observers';
import ItemsControl from './items-control'
import { GeneratorStatus, ISelectable } from 'ember-ux-controls/common/types';
import SelectedItemCollection, { SelectedItemCollectionChangedEventArgs } from 'ember-ux-controls/common/classes/-private/selected-item-collection';
import ItemInfo, { CONTAINERS } from 'ember-ux-controls/common/classes/-private/item-info';
import { assert } from '@ember/debug';
import EquatableArray from 'ember-ux-controls/common/classes/-private/equatable-array';
import { notifyPropertyChange } from '@ember/object';
import { computed } from '@ember/object';
import ItemCollection, { ItemCollectionChangedEventArgs } from 'ember-ux-controls/common/classes/-private/item-collection';
import ItemContainerGenerator, { ItemContainerGeneratorStatusChangedEventArgs } from './-private/item-container-generator';
import { once } from '@ember/runloop';

export interface ISelectItemsControlArgs extends IItemsControlArgs {
  selectFirstAfterLoad?: boolean
  multipleSelectionEnable?: boolean
  onSelectionChanged?: (selectedItems: Array<unknown>, unselectedItems: Array<unknown>) => boolean
}

export default abstract class SelectItemsControl<TA extends ISelectItemsControlArgs = {}>
  extends ItemsControl<TA> {
  constructor(
    owner: any,
    args: TA
  ) {
    super(owner, args);
    this.subscribe();
  }

  private subscribe() {
    addObserver(
      this,
      'multipleSelectionEnable',
      this.onMutlipleSelectionEnableChanged
    );

    this.itemContainerGenerator.addEventListener(
      this,
      ItemContainerGeneratorStatusChangedEventArgs,
      this.onGeneratorStatusChanged
    );
  }

  @computed('args.{multipleSelectionEnable}')
  public get multipleSelectionEnable()
    : boolean {
    return this.args.multipleSelectionEnable ?? false;
  }

  @computed('args.{selectFirstAfterLoad}')
  public get selectFirstAfterLoad()
    : boolean {
    return this.args.selectFirstAfterLoad ?? false;
  }

  public get selectedItems()
    : SelectedItemCollection {
    if (this._selectedItems) {
      return this._selectedItems;
    }

    this._selectedItems = SelectedItemCollection.Create();

    this._selectedItems.addEventListener(
      this,
      SelectedItemCollectionChangedEventArgs,
      this.onSelectedItemsCollectionChanged
    );

    return this._selectedItems;
  }

  public get selectedIndex()
    : number {
    return this._selectedIndex ?? -1;
  }

  public set selectedIndex(value: number) {
    if (this.selectedIndex === value) {
      return; //TODO: check what should I to return
    }

    value = SelectItemsControl.CoerceSelectedIndex(this, value);

    if (!this.selectionChanger.isActive && value >= 0) {
      this.selectionChanger.selectSingle(
        this.createInfo(null, null, value).reset(this.items.objectAt(value)),
        true
      );

      //notification of the property changed will happen 
      //in method: SelectedItemsControl.notifyPublicPropertyChanged
    }
  }

  public get selectedItem()
    : unknown {
    return this._selectedItem;
  }

  public set selectedItem(value: unknown) {
    if (this.selectedItem === value) {
      return; //TODO: check what should I to return
    }

    value = SelectItemsControl.CoerceSelectedItem(this, value);

    if (!this.selectionChanger.isActive) {
      this.selectionChanger.selectSingle(
        this.createInfo(null, value),
        false
      );

      //notification of the property changed will happen 
      //in method: SelectedItemsControl.notifyPublicPropertyChanged
    }
  }

  public get hasSelectedItems()
    : boolean {
    return (
      this.selectedInfos !== null &&
      this.selectedInfos.count > 0
    );
  }

  protected get selectedItemInternal()
    : unknown {
    return this._selectedInfos?.objectAt(0)?.item ?? null;
  }

  protected get selectedInfos()
    : SelectedItemStorage {
    if (typeof this._selectedInfos === 'undefined') {
      this._selectedInfos = SelectItemsControl.SelectedItemStorage.create();
    }
    return this._selectedInfos;
  }

  protected get selectionChanger()
    : SelectorChanger {
    if (!this._selector) {
      this._selector = new SelectItemsControl.SelectionChanger(this);
    }

    return this._selector;
  }

  public onSelect(
    container: unknown
  ): void {
    this.selectionChangeHelper(container, true);
  }

  public onUnselect(
    container: unknown
  ): void {
    this.selectionChangeHelper(container, false);
  }

  public willDestroy() {
    super.willDestroy();

    if (this._selectedItems) {
      this._selectedItems.removeEventListener(
        this,
        SelectedItemCollectionChangedEventArgs,
        this.onSelectedItemsCollectionChanged
      );
    }

    removeObserver(
      this,
      'multipleSelectionEnable',
      this.onMutlipleSelectionEnableChanged
    );

    this.itemContainerGenerator.removeEventListener(
      this,
      ItemContainerGeneratorStatusChangedEventArgs,
      this.onGeneratorStatusChanged
    );
  }

  protected onGeneratorStatusChanged(
    _: ItemContainerGenerator,
    args: ItemContainerGeneratorStatusChangedEventArgs
  ) {
    if (args.newStatus === GeneratorStatus.ContainersGenerated) {
      if (
        this.selectFirstAfterLoad &&
        this.selectedIndex === -1 &&
        this.items.count
      ) {
        //this._selectedIndex = 0;
        once(this, () => {
          this.selectedIndex = 0;
        })
      }
    }
  }

  protected unselectAllInternal() {
    let
      idx: number,
      count: number,
      selectedInfo: ItemInfo | undefined;

    this.selectionChanger.begin();

    try {
      for (
        idx = 0,
        count = this.selectedInfos.count;
        idx < count;
      ) {
        selectedInfo = this.selectedInfos.objectAt(idx++);
        if (typeof selectedInfo !== 'undefined') {
          this.selectionChanger.unselect(
            selectedInfo
          );
        }
      }
    } finally {
      this.selectionChanger.end();
    }
  }

  protected selectAllInternal() {
    let
      idx: number,
      count: number,
      itemInfo: ItemInfo;

    count = this.items.count;

    assert(
      'MultipleSelectionEnable should be true',
      this.multipleSelectionEnable
    );

    this.selectionChanger.begin();

    try {
      for (
        idx = 0;
        idx < count;
        idx++
      ) {
        itemInfo = this.createInfo(
          null,
          this.items.objectAt(idx),
          idx
        );

        this.selectionChanger.select(itemInfo, true);
      }
    } finally {
      this.selectionChanger.end();
    }
  }

  protected onSelectionChanged(
    selectedItems: Array<unknown>,
    unselectedItems: Array<unknown>
  ): void {
    if (typeof this.args.onSelectionChanged === 'function') {
      this.args.onSelectionChanged(selectedItems, unselectedItems);
    }
  }

  protected containerSetIsSelected(
    container: unknown,
    value: boolean
  ) {
    if (
      typeof (<ISelectable>container).isSelected !== 'undefined' &&
      (<ISelectable>container).isSelected !== value
    ) {
      (<ISelectable>container).isSelected = value;
    }
  }

  protected itemSetIsSelected(
    item: unknown,
    value: boolean
  ) {
    if (
      typeof (<ISelectable>item).isSelected !== 'undefined' &&
      (<ISelectable>item).isSelected !== value
    ) {
      (<ISelectable>item).isSelected = value;
    }
  }

  protected onItemCollectionChanged(
    sender: ItemCollection,
    args: ItemCollectionChangedEventArgs
  ): void {
    let
      newItems: Array<unknown>,
      oldItems: Array<unknown>,
      offset: number,
      addedCount: number,
      removedCount: number,
      replacedCount: number,
      toInsert: number,
      toRemove: number,
      newItem: unknown,
      oldItem: unknown,
      itemIndex: number,
      idx: number;

    super.onItemCollectionChanged(sender, args);

    newItems = args.newItems;
    oldItems = args.oldItems;
    offset = args.offset
    addedCount = newItems.length;
    removedCount = oldItems.length;

    // in case of replace
    if (addedCount > 0 && removedCount > 0) {
      toInsert = Math.max(addedCount - removedCount, 0);
      toRemove = Math.max(removedCount - addedCount, 0);
      replacedCount = Math.min(removedCount, addedCount);

      for (
        idx = 0;
        idx < replacedCount;
        idx++
      ) {
        itemIndex = offset + idx;
        newItem = newItems[idx];
        oldItem = oldItems[idx];
        this.infoCheckIsSelected(this.createInfo(null, newItem, itemIndex), false);
        this.onItemRemoved(oldItem, itemIndex);
      }
      // in case of items.replace(offset, 1, [x1, x2])
      if (toInsert > 0) {
        for (
          idx = 0;
          idx < toInsert;
          idx++
        ) {
          itemIndex = offset + replacedCount + idx;
          newItem = newItems[replacedCount + idx];
          this.onItemAdded(newItem, itemIndex);
        }
      }
      // in case of items.replace(offset, 2, [x1])
      if (toRemove > 0) {
        for (
          idx = 0;
          idx < toRemove;
          idx++
        ) {
          itemIndex = offset + replacedCount + idx;
          oldItem = oldItems[replacedCount + idx];
          this.onItemRemoved(oldItem, itemIndex);
        }
      }
    }
    // try to remove
    else if (removedCount > 0 && addedCount === 0) {
      for (
        idx = 0;
        idx < removedCount;
        idx++
      ) {
        oldItem = oldItems[idx];
        itemIndex = offset + idx;
        this.onItemRemoved(oldItem, itemIndex);
      }
    }
    // try to add
    else if (addedCount > 0 && removedCount === 0) {
      for (
        idx = 0;
        idx < addedCount;
        idx++
      ) {
        itemIndex = offset + idx;
        newItem = newItems[idx];
        this.onItemAdded(newItem, itemIndex);
      }
    }
  }

  protected onMutlipleSelectionEnableChanged() {
    this.validate();
  }

  private infoCheckIsSelected(
    info: ItemInfo,
    value: boolean
  ): void {
    if (info.container) {
      this.containerSetIsSelected(info.container, value);
    }

    if (info.item) {
      this.itemSetIsSelected(info.item, value)
    }
  }

  private onItemAdded(
    item: unknown,
    itemIndex: number
  ): void {
    let
      itemInfo: ItemInfo;

    this.selectionChanger.begin();
    try {
      itemInfo = this.createInfo(null, item, itemIndex);
      if (this.infoGetIsSelected(itemInfo)) {
        this.selectionChanger.select(itemInfo, true);
      }
    } finally {
      this.selectionChanger.end();
    }
  }

  private onItemRemoved(
    item: unknown,
    itemIndex: number
  ): void {
    let
      itemInfo: ItemInfo | undefined;

    this.selectionChanger.begin();
    try {
      itemInfo = this.createInfo(CONTAINERS.SENTINEL, item, itemIndex);
      itemInfo.container = null;

      if (this.selectedInfos.includes(itemInfo)) {
        this.selectionChanger.unselect(itemInfo);
      }
    } finally {
      this.selectionChanger.end();
    }
  }

  private infoGetIsSelected(
    info: ItemInfo
  ): boolean {
    if (info.container !== null) {
      return (<ISelectable>info.container).isSelected;
    }

    if (this.itemItsOwnContainer(info.item)) {
      return (<ISelectable>info.item).isSelected;
    }

    return false;
  }

  private selectionChangeHelper(
    container: unknown,
    value: boolean
  ): void {
    let
      info: ItemInfo,
      item: unknown;

    if (this.selectionChanger.isActive) {
      return;
    }

    if (!container) {
      return;
    }

    item = this.readItemFromContainer(container);

    this.selectionChanger.begin();

    try {
      info = this.createInfo(container, item);
      if (value) {
        this.selectionChanger.select(info, true);
      } else {
        this.selectionChanger.unselect(info);
      }
    } finally {
      this.selectionChanger.end();
    }
  }

  private validate()
    : void {
    if (this.selectedItems.count > 0) {
      this.selectionChanger.validate();
    }
  }

  private onSelectedItemsCollectionChanged(
    _: SelectedItemCollection,
    args: SelectedItemCollectionChangedEventArgs
  ): void {
    let
      oldItem: unknown,
      newItem: unknown,
      succeeded: boolean = false;

    if (this.selectionChanger.isActive) {
      return;
    }

    assert(
      'Do selection with selectedItem',
      this.multipleSelectionEnable
    );

    this.selectionChanger.begin();

    try {

      for (oldItem of args.oldItems) {
        this.selectionChanger.unselect(
          this.createUnresolvedInfo(oldItem)
        );
      }

      for (newItem of args.newItems) {
        this.selectionChanger.select(
          this.createUnresolvedInfo(newItem),
          false
        );
      }

      this.selectionChanger.end();
      succeeded = true;
    } finally {
      if (!succeeded) {
        this.selectionChanger.cancel();
      }
    }
  }

  private updateSelectedItems()
    : void {
    let
      toAddArray: Array<ItemInfo>,
      toRemoveArray: Array<ItemInfo>,
      idx: number,
      jdx: number,
      countSelected: number,
      countToRemove: number,
      itemInfo: ItemInfo,
      toRemoveIndex: number,
      selectedInfo: ItemInfo | undefined;

    assert(
      'SelectionChanged.isActive should be true',
      this.selectionChanger.isActive
    );

    toRemoveArray = Array<ItemInfo>(this.selectedItems.count);
    toAddArray = Array<ItemInfo>(0);

    for (
      idx = 0,
      countSelected = this.selectedItems.count;
      idx < countSelected;
      idx++
    ) {
      toRemoveArray[idx] = new ItemInfo(
        ~idx,
        this.selectedItems.objectAt(idx),
        CONTAINERS.SENTINEL
      );
    }

    itemInfo = new ItemInfo(-1, null, null);

    for (
      idx = 0,
      countSelected = this.selectedInfos.count;
      idx < countSelected;
      idx++
    ) {
      selectedInfo = this.selectedInfos.objectAt(idx);
      if (selectedInfo) {
        toRemoveIndex = -1;
        itemInfo.reset(selectedInfo.item);
        for (
          jdx = 0,
          countToRemove = toRemoveArray.length;
          jdx < countToRemove;
          jdx++
        ) {
          if (toRemoveArray[jdx].equals(itemInfo)) {
            toRemoveIndex = jdx;
            break;
          }
        }
        if (toRemoveIndex != -1) {
          toRemoveArray.splice(toRemoveIndex, 1);
        } else {
          toAddArray.push(selectedInfo)
        }
      }
    }

    if (toAddArray.length > 0 || toRemoveArray.length > 0) {
      this.applyUpdateSelectedItems(toAddArray, toRemoveArray);
      this.notifyPublicPropertyChanged();

    }
  }

  private notifyPublicPropertyChanged() {
    let
      selectedInfo: ItemInfo | undefined;

    selectedInfo = this.selectedInfos.objectAt(0);

    this._selectedIndex = selectedInfo?.index ?? -1;
    this._selectedItem = selectedInfo?.item

    notifyPropertyChange(this, 'selectedItem');
    notifyPropertyChange(this, 'selectedIndex');
    notifyPropertyChange(this, 'hasSelectedItems')
  }

  private applyUpdateSelectedItems(
    toAddArray: Array<ItemInfo>,
    toRemoveArray: Array<ItemInfo>
  ): void {
    let
      idx: number,
      count: number;

    assert(
      'selectionChanger.isActive shoud be true',
      this.selectionChanger.isActive
    );

    for (
      idx = 0,
      count = toAddArray.length;
      idx < count;
      idx++
    ) {
      this.selectedItems.pushObject(toAddArray[idx].item);
    }

    for (
      idx = toRemoveArray.length - 1,
      count = 0;
      idx >= count;
      idx--
    ) {
      this.selectedItems.removeAt(~toRemoveArray[idx].index);
    }
  }

  private static CoerceSelectedIndex(
    selector: SelectItemsControl,
    value: number
  ): number {
    if (
      typeof value === 'number' &&
      value < selector.items.count
    ) {
      return value;
    }

    return -1;
  }

  private static CoerceSelectedItem(
    selector: SelectItemsControl,
    item: unknown
  ): unknown {
    let
      selectedIndex: number

    selectedIndex = selector.selectedIndex;

    if ((
      selectedIndex > -1 &&
      selectedIndex < selector.items.count &&
      selector.items.objectAt(selectedIndex) === item
    ) || (selector.items.includes(item))
    ) {
      return item;
    }

    return null;
  }

  private static SelectionChanger = class {
    constructor(
      public owner: SelectItemsControl
    ) {
      this.isActive = false;

      this.toSelect = SelectItemsControl.SelectedItemStorage.create({
        matchUnresolved: true
      });

      this.toUnselect = SelectItemsControl.SelectedItemStorage.create({
        matchUnresolved: true
      });
    }

    public isActive: boolean;
    public toSelect: EquatableArray<ItemInfo>
    public toUnselect: EquatableArray<ItemInfo>

    end() {
      const
        selectedItems: Array<ItemInfo> = [],
        unselectedItems: Array<ItemInfo> = [];

      try {
        this.applyCanSelectMultiple();
        this.createDelta(selectedItems, unselectedItems);
        this.owner.updateSelectedItems();
      } finally {
        this.cleanup();
      }

      if (selectedItems.length || unselectedItems.length) {
        this.owner.onSelectionChanged(
          selectedItems.map(info => info.item),
          unselectedItems.map(info => info.item)
        )
      }
    }

    cancel() {
      this.cleanup()
    }

    unselect(info: ItemInfo) {
      let
        idx: number,
        key: ItemInfo;

      // ignore if item is going to be unselected
      if (this.toUnselect.includes(info)) {
        return false;
      }

      key = ItemInfo.Key(info);
      idx = this.toSelect.indexOf(key);

      if (idx != -1) {
        this.toSelect.removeAt(idx);
        return true;
      }

      // ignore if is not selected
      if (!this.owner.selectedInfos.includes(key)) {
        return false;
      }

      if (this.toUnselect.includes(info)) {
        return false;
      }

      this.toUnselect.pushObject(info);

      return true;
    }

    /**
     * Queue something to be select/unselect. 
     * @param {ItemInfo} wantToBeSelected
     * @param {Boolean} assumeInItemsCollection
     */
    select(
      wantToBeSelected: ItemInfo,
      assumeInItemsCollection: boolean
    ) {
      let
        idx: number,
        key: ItemInfo;

      // #1 check if item in items collection
      if (!assumeInItemsCollection) {
        assert(
          'Selected item is not yet in collection',
          this.owner.items.includes(wantToBeSelected.item)
        );
      }
      // #2 check if waiting to be unselected

      key = ItemInfo.Key(wantToBeSelected);
      idx = this.toUnselect.indexOf(key);
      if (idx != -1) {
        this.toUnselect.removeAt(idx);
        return true;
      }

      // #3 ignore if already selected
      if (this.owner.selectedInfos.includes(key)) {
        return false;
      }

      // #4 ignore if waiting to be selected
      if (!key.isKey && this.toSelect.includes(key)) {
        return false;
      }

      // #5 clear waiting list of selection if multiple selection not allowed 
      if (this.owner.multipleSelectionEnable === false && this.toSelect.count) {
        this.toSelect.forEach(shouldBeUnselected =>
          this.owner.infoCheckIsSelected(shouldBeUnselected, false)
        );
        this.toSelect.clear();
      }

      this.toSelect.pushObject(wantToBeSelected);

      return true;
    }

    selectSingle(info: ItemInfo | null, assumeInItemsCollection: boolean) {
      let
        alreadySelected: ItemInfo | undefined,
        idx: number,
        selected = false;

      this.begin();

      try {
        for (
          idx = this.owner.selectedItems.count - 1;
          idx >= 0;
          idx--
        ) {
          alreadySelected = this.owner.selectedInfos.objectAt(idx);
          if (alreadySelected && !alreadySelected.equals(info)) {
            this.unselect(alreadySelected);
          } else {
            selected = true;
          }
        }

        if (!selected && info) {
          this.select(info, assumeInItemsCollection);
        }
      } finally {
        this.end();
      }
    }

    applyCanSelectMultiple() {
      let
        count: number;

      if (this.owner.multipleSelectionEnable) {
        return;
      }

      if (this.toSelect.count === 1) {
        if (this.owner.selectedInfos.count > 0) {
          this.toUnselect.clear();
          this.toUnselect.pushObjects(this.owner.selectedInfos);
        }
      } else {
        count = this.owner.selectedInfos.count;
        // if multipleSelectionEnable changed from true to false
        if (count > 1 && count != this.toUnselect.count + 1) {
          this.toUnselect.clear();
          // unselect all but the first
          this.toUnselect.pushObjects(
            this.owner.selectedInfos.without(
              this.owner.selectedInfos.objectAt(0) as ItemInfo
            )
          )
        }
      }
    }

    begin() {
      this.isActive = true;
    }

    cleanup() {
      this.isActive = false;
      this.toSelect.clear();
      this.toUnselect.clear();
    }

    createDelta(
      toSelect: ItemInfo[],
      toUnselect: ItemInfo[]
    ) {
      let
        info: ItemInfo,
        key: ItemInfo,
        match: ItemInfo | undefined,
        unresolvedInfos: Array<ItemInfo> | null,
        unresolvedInfosCount: number,
        idx: number,
        count: number;

      if (this.toSelect.count > 0 || this.toUnselect.count > 0) {
        unresolvedInfos = null
        for (
          idx = 0,
          count = this.toUnselect.count;
          idx < count;
          idx++
        ) {
          info = this.toUnselect.objectAt(idx) as ItemInfo;
          if (info.isResolved) {
            this.owner.infoCheckIsSelected(info, false);
            this.owner.selectedInfos.removeObject(info);
            toUnselect.push(info);
          } else {
            if (unresolvedInfos === null) {
              unresolvedInfos = [];
            }
            unresolvedInfos.push(info);
          }
        }

        if (unresolvedInfos) {
          for (info of unresolvedInfos) {
            match = this.owner.selectedInfos.find(alreadySelected =>
              alreadySelected.equals(ItemInfo.Key(info))
            );

            if (match) {
              this.owner.infoCheckIsSelected(match, false);
              this.owner.selectedInfos.removeObject(match);
              toUnselect.push(match);
            }
          }
        }
      }

      for (
        idx = 0,
        count = this.toSelect.count;
        idx < count;
      ) {
        info = this.toSelect.objectAt(idx) as ItemInfo;
        if (info.isResolved) {
          this.owner.infoCheckIsSelected(info, true);
          if (!this.owner.selectedInfos.includes(info)) {
            this.owner.selectedInfos.pushObject(info);
            toSelect.push(info);
          }
          this.toSelect.removeAt(idx);
          count--;
        } else {
          idx++;
        }
      }

      unresolvedInfosCount = idx

      for (
        idx = 0,
        count = this.owner.items.count;
        unresolvedInfosCount > 0 && idx < count;
        idx++
      ) {
        info = this.owner.createInfo(
          null,
          this.owner.items.objectAt(idx),
          idx
        );

        key = new ItemInfo(-1, info.item, CONTAINERS.KEY);

        if (
          this.toSelect.includes(key) &&
          !this.owner.selectedInfos.includes(info)
        ) {
          this.owner.infoCheckIsSelected(info, true);
          this.owner.selectedInfos.pushObject(info);
          toSelect.push(info);
          this.toSelect.removeObject(key);
          unresolvedInfosCount--;
        }
      }
    }

    validate() {
      this.begin();
      this.end();
    }
  }

  private static SelectedItemStorage = class extends EquatableArray<ItemInfo> {
    matchUnresolved: boolean = false

    protected compare(
      left: any,
      right: any
    ) {
      if (left === right) {
        return true;
      }

      return (
        left === null
          ? right === null
          : (
            left instanceof ItemInfo &&
            left.equals(right, this.matchUnresolved)
          )
      );
    }
  }

  private _selectedIndex?: number
  private _selectedItem?: unknown
  private _selectedInfos?: SelectedItemStorage
  private _selectedItems?: SelectedItemCollection
  private _selector?: SelectorChanger
}


type SelectedItemStorage = {
  matchUnresolved: boolean
} & EquatableArray<ItemInfo>

type SelectorChanger = {
  isActive: boolean;
  toSelect: EquatableArray<ItemInfo>
  toUnselect: EquatableArray<ItemInfo>
  end: () => void
  select: (info: ItemInfo, assumeInItemsCollection: boolean) => boolean
  unselect: (info: ItemInfo) => boolean
  selectSingle: (info: ItemInfo, assumeInItemsCollection: boolean) => void
  begin: () => void
  cleanup: () => void
  cancel: () => void
  createDelta: (toSelect: object[], toUnselect: object[]) => void
  applyCanSelectMultiple: () => void
  validate: () => void
}