import { assert } from '@ember/debug';
import { getOwner } from '@ember/application';
import {
  IEquatable, GeneratorDirection, IGeneratorHost,
  IDisposable, ItemCollectionActions,
  GeneratorStatus, IEventArgs, EventArgs, IEventEmmiter
} from 'ember-ux-controls/common/types';
import { BaseEventArgs } from 'ember-ux-controls/common/classes/event-args';
import ItemsControl from 'ember-ux-controls/common/classes/items-control';
import ItemCollection, { ItemCollectionChangedEventArgs } from './item-collection';

export class ItemContainerGeneratorChangedEventArgs extends BaseEventArgs {
  constructor(
    public action: ItemCollectionActions,
    public position: GeneratorPosition,
    public itemCount: number,
    public itemUICount: number,
  ) {
    super();
  }
}

export class GeneratorStatusChangedEventArgs extends BaseEventArgs {
  constructor(
    public oldStatus: GeneratorStatus | null,
    public newStatus: GeneratorStatus | null
  ) { super() }
}

export class MapChangedEventArgs extends BaseEventArgs {
  constructor(
    public block: ItemBlock | null,
    public offset: number,
    public count: number,
    public newBlock: ItemBlock | null,
    public newOffset: number,
    public deltaCount: number
  ) {
    super();
  }
}

export class GeneratorPosition implements IEquatable {
  constructor(
    public index: number,
    public offset: number
  ) { }

  equals(other: object) {
    return (
      other instanceof GeneratorPosition &&
      this.index === other.index &&
      this.offset === other.offset
    )
  }
}

export default class ItemContainerGenerator implements IDisposable {
  constructor(
    public host: IGeneratorHost
  ) {
    this.eventEmmiter.addEventListener(
      this,
      ItemCollectionChangedEventArgs,
      this.onItemCollectionChanged
    )

    this.refresh();
  }

  public get status() {
    return this._status;
  }

  protected get itemsInternal(): ItemCollection {
    return this.host.view;
  }

  private get eventEmmiter() {
    if (!this._eventEmmiter) {
      this._eventEmmiter = getOwner(this.host).lookup('service:event-emmiter') as IEventEmmiter
    }

    return this._eventEmmiter;
  }

  public startAt(
    position: GeneratorPosition,
    direction: GeneratorDirection,
    allowMovePastRealizedItem: boolean = false
  ): Generator {
    if (this._generator) {
      //TODO: throw Error
      throw new Error();
    }

    this._generator = new ItemContainerGenerator.Generator(
      this,
      position,
      direction,
      allowMovePastRealizedItem
    );

    return this._generator;
  }

  public generateNext(stopAtRealized: boolean = true) {
    if (!this._generator) {
      //TODO: trow Error
      throw new Error();
    }

    return this._generator.generateNext(stopAtRealized);
  }

  public remove(
    position: GeneratorPosition,
    count: number
  ) {

    let
      block: ItemBlock,
      index: number,
      offset: number,
      offsetL: number,
      offsetR: number,
      container: object,
      blockL: RealizedItemBlock,
      blockR: RealizedItemBlock,
      rBlock: RealizedItemBlock,
      blockX: RealizedItemBlock,
      edgeL: boolean,
      edgeR: boolean,
      abutL: boolean,
      abutR: boolean,
      blockT: UnrealizedItemBlock,
      predecessor: ItemBlock | null = null,
      offsetT: number,
      deltaCount: number,
      itemCount: number,
      remaining: number;

    if (position.offset != 0) {
      throw new Error('offset should be null');
    }
    if (count <= 0) {
      throw new Error('count should be positive count');
    }

    if (!this._itemMap) {
      return;
    }

    index = position.index;
    offsetL = index;

    for (
      block = this._itemMap.next;
      block !== this._itemMap;
      block = block.next
    ) {
      if (offsetL < (block.containerCount ?? 0)) {
        break;
      }
      offsetL -= block.containerCount;
    }

    blockL = block as RealizedItemBlock;
    offsetR = offsetL + count - 1;

    for (
      ;
      block !== this._itemMap;
      block = block.next
    ) {
      if (!(block instanceof RealizedItemBlock)) {
        throw new Error(`cant't move unrealized items`);
      }

      if (offsetR < block.containerCount) {
        break;
      }

      offsetR -= block.containerCount;
    }

    blockR = block as RealizedItemBlock;
    offset = offsetL;
    rBlock = blockL;

    while (rBlock !== blockR || offset <= offsetR) {
      container = rBlock.containerAt(offset);

      ItemContainerGenerator.UnlinkContainerFromItem(
        container,
        rBlock.itemAt(offset),
        this.host
      );

      if (
        ++offset >= rBlock.containerCount &&
        rBlock !== blockR
      ) {
        rBlock = rBlock.next as RealizedItemBlock;
        offset = 0;
      }
    }

    edgeL = offsetL === 0;
    edgeR = offsetR === blockR.itemCount - 1;
    //a`butting block left
    abutL = edgeL && blockL.prev instanceof UnrealizedItemBlock;
    //a`butting block right
    abutR = edgeR && blockR.next instanceof UnrealizedItemBlock;

    predecessor = null;
    offsetT = 0;
    deltaCount = 0;

    if (abutL) {
      blockT = blockL.prev as UnrealizedItemBlock;
      offsetT = blockT.itemCount;
      deltaCount = -blockT.itemCount;
    } else if (abutR) {
      blockT = blockL.next as UnrealizedItemBlock;
      offsetT = 0;
      deltaCount = offsetL;
    } else {
      blockT = new UnrealizedItemBlock();
      offsetT = 0;
      deltaCount = offsetL;
      //remember where the new block goes
      predecessor = edgeL ? block.prev : blockL;
    }

    for (block = blockL; block != blockR; block.next) {
      itemCount = block.itemCount;

      this.moveItems(
        block,
        offsetL,
        itemCount - offsetL,
        blockT,
        offsetT,
        deltaCount
      )

      offsetT += itemCount - offsetL;
      offsetL = 0;
      deltaCount -= itemCount;
      if (block.itemCount === 0) {
        block.remove();
      }
    }

    remaining = block.itemCount - 1 - offsetR;

    this.moveItems(
      block,
      offsetL,
      offsetR - offsetL + 1,
      blockT,
      offsetT,
      deltaCount
    )

    blockX = blockR;

    if (!edgeR) {
      if (blockL === blockR && !edgeL) {
        blockX = new RealizedItemBlock();
      }

      this.moveItems(
        block,
        offsetR + 1,
        remaining,
        blockX,
        /*newOffset: */ 0,
        offsetR + 1
      )
    }

    if (predecessor) {
      blockT.insertAfter(predecessor);
    }

    if (blockX != blockR) {
      blockX.insertAfter(blockT);
    }

    this.removeAndMergeBlocksIfNeeded(block);
  }

  public removeAll() {
    this.removeAllInternal();
  }

  public containerFromIndex(index: number) {
    let
      block: ItemBlock,
      container: object | null = null;

    if (this._itemMap === null) {
      return null;
    }

    for (
      block = this._itemMap.next;
      block !== this._itemMap;
      block = block.next
    ) {
      if (index < block.itemCount) {
        container = block.containerAt(index);
        break;
      }

      index -= block.itemCount;
    }

    return container;
  }

  public itemFromContainer(container: unknown) {
    let
      item: unknown;

    item = this.doLinearSearch((_, innerContainer) =>
      innerContainer === container
    )[2];

    return item;
  }

  public containerFromItem(item: unknown) {
    let
      container: object | null;

    container = this.doLinearSearch((innerItem, _) =>
      innerItem === item
    )[1];

    return container;
  }

  public indexFromContainer(container: unknown) {
    let
      index: number;

    index = this.doLinearSearch((_, innerContainer) =>
      innerContainer === container
    )[3];

    return index;
  }

  public dispose() {
    if (this._isDisposed) {
      return;
    }

    if (this.host instanceof ItemsControl) {
      this.eventEmmiter.removeEventListener(
        this,
        ItemCollectionChangedEventArgs,
        this.onItemCollectionChanged
      );
    }

    if (this._generator) {
      this._generator.dispose();
      this._generator = null;
    }

    this._isDisposed = true;
  }

  public prepareItemContainer(container: object) {
    this.host.prepareItemContainer(container);
  }

  public findItem(
    match: (item: unknown, container: object) => boolean
  ): [boolean, object | null, unknown, number] {
    return this.doLinearSearch(match);
  }

  protected static UnlinkContainerFromItem(
    container: any,
    item: unknown,
    host: IGeneratorHost
  ) {
    host.clearContainerForItem(container, item);
  }

  protected static LinkContainerToItem(
    container: object,
    item: unknown,
    host: IGeneratorHost
  ) {
    host.linkContainerToItem(container, item);
  }

  protected refresh() {
    this.removeAll();
  }

  private realize(
    block: UnrealizedItemBlock,
    offset: number,
    item: unknown,
    container: object
  ) {
    let
      prevR: RealizedItemBlock,
      nextR: RealizedItemBlock,
      newBlock: RealizedItemBlock,
      newOffset: number,
      //deltaCount: number,
      newUBlock: UnrealizedItemBlock;

    if (
      offset === 0 &&
      block.prev instanceof RealizedItemBlock &&
      block.prev.itemCount < ItemBlock.BlockSize
    ) {
      prevR = block.prev;
      newBlock = prevR;
      newOffset = prevR.itemCount;
      this.moveItems(block, offset, 1, newBlock, newOffset, -prevR.itemCount);
      this.moveItems(block, 1, block.itemCount, block, 0, +1);
    } else if (
      offset === block.itemCount - 1 &&
      block.next instanceof RealizedItemBlock &&
      block.next.itemCount < ItemBlock.BlockSize
    ) {
      nextR = block.next;
      newBlock = nextR;
      newOffset = 0;
      this.moveItems(newBlock, 0, newBlock.itemCount, newBlock, 1, -1);
      this.moveItems(block, offset, 1, newBlock, newOffset, offset);
    } else {
      newBlock = new RealizedItemBlock();
      newOffset = 0;
      //deltaCount = offset
      if (offset === 0) {
        newBlock.insertBefore(block);
        this.moveItems(block, offset, 1, newBlock, newOffset, 0);
        this.moveItems(block, 1, block.itemCount, block, 0, +1);
      } else if (offset === block.itemCount - 1) {
        newBlock.insertAfter(block);
        this.moveItems(block, offset, 1, newBlock, newOffset, offset);
      } else {
        newUBlock = new UnrealizedItemBlock();
        newUBlock.insertAfter(block);
        newBlock.insertAfter(block);
        this.moveItems(block, offset + 1, block.itemCount - offset - 1, newUBlock, 0, offset + 1);
        this.moveItems(block, offset, 1, newBlock, 0, offset);
      }
    }
    this.removeAndMergeBlocksIfNeeded(block);
    newBlock.realizeItem(newOffset, item, container);
  }

  private removeAndMergeBlocksIfNeeded(block: ItemBlock | null) {
    if (block !== null && block !== this._itemMap && block.itemCount === 0) {
      block.remove();

      if (
        block.prev instanceof UnrealizedItemBlock &&
        block.next instanceof UnrealizedItemBlock
      ) {
        this.moveItems(
          /* block:     */ block.next,
          /* offset     */ 0,
          /* count      */ block.next.itemCount,
          /* newBlock   */ block.prev,
          /* newOffset  */ block.prev.itemCount,
          /* deltaCount */ -block.prev.itemCount - 1
        );

        block.next.remove();
      }
    }
  }

  private moveItems(
    block: ItemBlock,
    offset: number,
    count: number,
    newBlock: ItemBlock,
    newOffset: number,
    deltaCount: number
  ) {
    if (
      block instanceof RealizedItemBlock &&
      newBlock instanceof RealizedItemBlock
    ) {
      newBlock.copyEntries(block, offset, count, newOffset);
    } else if (
      block instanceof RealizedItemBlock &&
      block.itemCount > count
    ) {
      block.clearEntries(offset, count);
    }

    block.itemCount -= count;
    newBlock.itemCount += count;

    this.notifyListeners(
      MapChangedEventArgs,
      block,
      offset,
      count,
      newBlock,
      newOffset,
      deltaCount
    );
  }

  private removeAllInternal() {
    let
      itemMap: ItemBlock | null,
      uib: UnrealizedItemBlock,
      block: ItemBlock,
      offset: number;

    itemMap = this._itemMap;
    this._itemMap = null;

    try {
      if (itemMap !== null) {
        for (
          block = itemMap.next;
          block != itemMap;
          block = block.next
        ) {
          if (block instanceof RealizedItemBlock) {
            for (
              offset = 0;
              offset < block.containerCount;
              ++offset
            ) {
              ItemContainerGenerator.UnlinkContainerFromItem(
                block.containerAt(offset),
                block.itemAt(offset),
                this.host
              );
            }
          }
        }
      }
    } finally {
      this._itemMap = new ItemBlock();
      this._itemMap.prev = this._itemMap.next = this._itemMap;
      uib = new UnrealizedItemBlock();
      uib.insertAfter(this._itemMap);
      uib.itemCount = this.itemsInternal.count;

      this.notifyListeners(
        MapChangedEventArgs,
        /*block:     */ null,
        /*offset:    */ -1,
        /*count:     */ 0,
        /*newBlock:  */ uib,
        /*newOffset: */ 0,
        /*deltaCount:*/ 0
      );
    }
  }

  private moveToPosition(
    position: GeneratorPosition,
    direction: GeneratorDirection,
    allowMovePastRealizedItem: boolean,
    state: GeneratorState
  ) {
    let
      block: ItemBlock,
      itemIndex: number,
      offset: number,
      isf: boolean,
      itemCount: number,
      index: number;

    if (this._itemMap === null) {
      return;
    }

    block = this._itemMap;
    itemIndex = 0;
    offset = position.offset;
    isf = direction === GeneratorDirection.Forward;

    // if position set, move to 
    if (position.index != -1) {

      itemCount = 0;
      index = position.index;

      block = block.next;
      while (index >= block.containerCount) {
        itemCount += block.itemCount;
        index -= block.containerCount;
        itemIndex += block.itemCount;
        block = block.next;
      }

      //and set the position
      state.block = block;
      state.offset = index;
      state.count = itemCount;
      state.index = itemIndex + index
    } else {
      // set first
      state.block = block;
      state.offset = 0;
      state.count = 0;
      state.index = itemIndex - 1
    }

    offset = position.offset;
    if (offset === 0 && (!allowMovePastRealizedItem || state.block == this._itemMap)) {
      offset = ~~isf - 1 | 1; //if direction is forward 1, otherwise -1
    }

    if (offset > 0) {
      state.block.moveForward(state, true);
      --offset;

      while (offset > 0) {
        offset -= state.block.moveForward(
          state,
          allowMovePastRealizedItem,
          offset
        )
      }
    } else if (offset < 0) {
      if (state.block === this._itemMap) {
        state.index = state.count = this.itemsInternal.count;
      }

      state.block.moveBackward(state, true)
      ++offset;

      while (offset < 0) {
        offset += state.block.moveBackward(
          state,
          allowMovePastRealizedItem,
          -offset
        );
      }
    }
  }

  protected onItemCollectionChanged(
    sender: ItemCollection, {
      newItems,
      oldItems,
      offset
    }: ItemCollectionChangedEventArgs<unknown>
  ): void {
    let
      addedCount: number,
      removedCount: number,
      replacedCount: number,
      toInsert: number,
      toRemove: number,
      newItem: unknown,
      oldItem: unknown,
      removedItem: unknown,
      itemIndex: number,
      index: number;

    if (sender !== this.itemsInternal) {
      return;
    }

    addedCount = newItems.length;
    removedCount = oldItems.length;

    // in case of replace
    if (addedCount > 0 && removedCount > 0) {
      toInsert = Math.max(addedCount - removedCount, 0);
      toRemove = Math.max(removedCount - addedCount, 0);
      replacedCount = Math.min(removedCount, addedCount);

      for (
        index = 0;
        index < replacedCount;
        index++
      ) {
        itemIndex = offset + index;
        newItem = newItems[index];
        oldItem = oldItems[index];
        this.onItemReplaced(oldItem, newItem, itemIndex);
      }
      // in case of items.replace(offset, 1, [x1, x2])
      if (toInsert > 0) {
        for (
          index = 0;
          index < toInsert;
          index++
        ) {
          itemIndex = offset + replacedCount + index;
          newItem = newItems[replacedCount + index];
          this.onItemAdded(newItem, itemIndex);
        }
      }
      // in case of items.replace(offset, 2, [x1])
      if (toRemove > 0) {
        for (
          index = 0;
          index < toRemove;
          index++
        ) {
          itemIndex = offset + replacedCount;
          removedItem = oldItems[replacedCount + index];
          this.onItemRemoved(removedItem, itemIndex);
        }
      }
    }
    // try to remove
    else if (removedCount > 0 && addedCount === 0) {
      for (
        index = 0;
        index < removedCount;
        index++
      ) {
        removedItem = oldItems[index];
        this.onItemRemoved(removedItem, offset);
      }
    }
    // try to add
    else if (addedCount > 0 && removedCount === 0) {
      for (
        index = 0;
        index < addedCount;
        index++
      ) {
        itemIndex = offset + index;
        newItem = newItems[index];
        this.onItemAdded(newItem, itemIndex);
      }
    }
  }

  private onItemReplaced(
    oldItem: unknown,
    newItem: unknown,
    index: number
  ) {
    let
      position: GeneratorPosition,
      block: ItemBlock | null,
      offsetFromBlockStart: number,
      //correctIndex: number,
      rib: RealizedItemBlock,
      container: object;

    [
      block,
      position,
      offsetFromBlockStart
      /*,correctIndex*/
    ] = this.getBlockAndPosition(oldItem, index, false);

    if (block instanceof RealizedItemBlock) {
      rib = block;

      container = rib.containerAt(offsetFromBlockStart);

      if (container /* !== oldItem && !host.isitemisowncontainer*/) {
        rib.realizeItem(offsetFromBlockStart, newItem, container);

        ItemContainerGenerator.LinkContainerToItem(
          container,
          newItem,
          this.host
        );

        this.notifyListeners(
          ItemContainerGeneratorChangedEventArgs,
          ItemCollectionActions.Replace,
          position,
          /*itemCount  */ 1,
          /*itemUICount*/ 1
        );

      } else {
        container = this.host.containerForItem(newItem);
        rib.realizeItem(offsetFromBlockStart, newItem, container);
        ItemContainerGenerator.LinkContainerToItem(
          container,
          newItem,
          this.host
        );

        this.notifyListeners(
          ItemContainerGeneratorChangedEventArgs,
          ItemCollectionActions.Replace,
          position,
          /*itemCount  */ 1,
          /*itemUICount*/ 1
        );

        ItemContainerGenerator.UnlinkContainerFromItem(
          container,
          newItem,
          this.host
        );
      }
    }
  }

  private notifyListeners(
    type: EventArgs<IEventArgs>,
    ...args: any[]
  ) {
    this.eventEmmiter.emitEvent(this, type, ...args);
  }

  //@ts-ignore
  private onRefresh() {
    let
      position: GeneratorPosition;

    position = new GeneratorPosition(0, 0);

    this.removeAll();

    this.notifyListeners(
      ItemContainerGeneratorChangedEventArgs,
      ItemCollectionActions.Reset,
      position,
      /*itemCount  */ 0,
      /*itemUICount*/ 0
    );
  }

  private onItemAdded(item: any, itemIndex: number) {
    let
      position: GeneratorPosition,
      block: ItemBlock,
      offsetFromBlockStart: number,
      unrealizedItemsSkipped: number,
      uib: UnrealizedItemBlock,
      newBlock: RealizedItemBlock;

    if (this._itemMap === null) {
      return;
    }

    position = new GeneratorPosition(-1, 0);
    block = this._itemMap.next;
    offsetFromBlockStart = itemIndex;
    unrealizedItemsSkipped = 0;

    if (itemIndex >= 0) {
      assert('Item index is not correct', this.itemsInternal.objectAt(itemIndex) === item)
    } else {
      itemIndex = this.itemsInternal.indexOf(item);
      assert('Item missing', itemIndex < 0)
    }

    while (
      block !== this._itemMap &&
      offsetFromBlockStart >= block.itemCount
    ) {
      offsetFromBlockStart -= block.itemCount;
      position.index += block.containerCount;
      unrealizedItemsSkipped = block.containerCount > 0
        ? 0
        : unrealizedItemsSkipped + block.itemCount;
      block = block.next;
    }

    position.offset = unrealizedItemsSkipped + offsetFromBlockStart + 1;

    if (block instanceof UnrealizedItemBlock) {
      uib = block;
      this.moveItems(
        uib,
        offsetFromBlockStart,
        /*count*/ 1,
        uib,
        offsetFromBlockStart + 1,
        /*deltaCount*/ 0
      );
      ++uib.itemCount;
    } else if (
      (offsetFromBlockStart === 0 || block === this._itemMap) &&
      (block.prev instanceof UnrealizedItemBlock)
    ) {
      uib = block.prev;
      ++uib.itemCount;
    } else {
      uib = new UnrealizedItemBlock();
      uib.itemCount = 1;

      if (
        offsetFromBlockStart > 0 &&
        block instanceof RealizedItemBlock
      ) {
        newBlock = new RealizedItemBlock();
        this.moveItems(
          block,
          offsetFromBlockStart,
          block.itemCount - offsetFromBlockStart,
          newBlock,
          /*newOffset*/ 0,
          offsetFromBlockStart
        );

        newBlock.insertAfter(block);
        position.index += block.containerCount;
        position.offset = 1;
        block = newBlock;
      }

      uib.insertBefore(block);
    }

    this.notifyListeners(
      MapChangedEventArgs,
      /*block     */ null,
      /*offset    */ itemIndex,
      /*count     */ +1,
      /*newBlock  */ uib,
      /*newOffset */ 0,
      /*deltaCount*/ 0
    );

    this.notifyListeners(
      ItemContainerGeneratorChangedEventArgs,
      ItemCollectionActions.Add,
      position,
      /*itemCount  */ 1,
      /*itemUICount*/ 0
    );
  }

  private onItemRemoved(item: any, itemIndex: number) {
    let
      container: object | null,
      containerCount: number,
      block: ItemBlock | null,
      position: GeneratorPosition,
      offsetFromBlockStart: number,
      others: any[];

    container = null;
    containerCount = 0;

    [
      block,
      position,
      offsetFromBlockStart,
      ...others
    ] = this.getBlockAndPosition(item, itemIndex, true);

    //TODO: can be null. maybe better to throw an exception
    //cant find item 
    if (block === null) {
      return;
    }

    if (block instanceof RealizedItemBlock) {
      containerCount = 1;
      container = block.containerAt(offsetFromBlockStart);
    }

    this.moveItems(
      block,
      offsetFromBlockStart + 1,
      block.itemCount - offsetFromBlockStart - 1,
      block,
      offsetFromBlockStart,
      /*deltaCount*/ 0
    )

    --block.itemCount;

    this.removeAndMergeBlocksIfNeeded(block);

    this.notifyListeners(
      MapChangedEventArgs,
      /*block      */ null,
      /*offset     */ itemIndex,
      /*count      */ -1,
      /*newBlock   */ null,
      /*newOffset  */ 0,
      /*deltaCount */ 0
    );

    this.notifyListeners(
      ItemContainerGeneratorChangedEventArgs,
      ItemCollectionActions.Remove,
      position,
      /*itemCount*/ 1,
      containerCount
    );

    if (container) {
      ItemContainerGenerator.UnlinkContainerFromItem(
        container,
        item,
        this.host
      );
    }

    //Groups not supported

  }

  private getBlockAndPosition(
    item: any,
    itemIndex: number,
    deletedFromItems: boolean
  ): [ItemBlock | null, GeneratorPosition, number, number] /*offsetFromBlockStart*/ {
    let
      position: GeneratorPosition,
      block: ItemBlock | null = null,
      offsetFromBlockStart = 0,
      correctIndex = 0,
      containerIndex = 0,
      deletionOffset = ~~deletedFromItems,
      rib: RealizedItemBlock,
      itemIsInCurrentBlock: boolean,
      currentItem: unknown,
      count: number;

    position = new GeneratorPosition(-1, 0);

    if (itemIndex >= 0) {
      offsetFromBlockStart = correctIndex = itemIndex;
      if (this._itemMap === null || itemIndex < 0) {
        return [
          block,
          position,
          offsetFromBlockStart,
          correctIndex
        ];
      }

      for (
        block = this._itemMap.next;
        block !== this._itemMap;
        block = block.next
      ) {
        if (offsetFromBlockStart >= block.itemCount) {
          containerIndex += block.containerCount;
          offsetFromBlockStart -= block.itemCount;
        } else {
          if (block.containerCount > 0) {
            //block hast realized items
            position = new GeneratorPosition(
              /*index: */ containerIndex + offsetFromBlockStart,
              /*offset:*/ 0
            );
          } else {
            // block has unrealized items
            position = new GeneratorPosition(
              /*index: */ containerIndex - 1,
              /*offset:*/ offsetFromBlockStart + 1
            )
          }
          break;
        }
      }
    } else {
      if (this._itemMap === null) {
        block = null;
        return [
          block,
          position,
          offsetFromBlockStart,
          correctIndex
        ];
      }

      for (
        block = this._itemMap.next;
        block !== this._itemMap;
        block = block.next
      ) {
        if (block instanceof RealizedItemBlock) {
          rib = block;
          offsetFromBlockStart = rib.offsetOfItem(item);
          if (offsetFromBlockStart >= 0) {
            position = new GeneratorPosition(
              /*index: */ containerIndex + offsetFromBlockStart,
              /*offset:*/ 0
            );
            correctIndex += offsetFromBlockStart;
            break;
          }
        } else if (block instanceof UnrealizedItemBlock) {
          itemIsInCurrentBlock = false;

          if (
            block.next instanceof RealizedItemBlock &&
            block.next.containerCount > 0
          ) {
            rib = block.next as RealizedItemBlock;
            currentItem = this.itemsInternal.objectAt(
              correctIndex + block.itemCount - deletionOffset
            );
            itemIsInCurrentBlock = rib.itemAt(0) === currentItem;
          } else if (block.next === this._itemMap) {
            count = correctIndex + block.itemCount - deletionOffset;
            itemIsInCurrentBlock = (
              block.prev === this._itemMap ||
              this.itemsInternal.count === count
            )
          }

          if (itemIsInCurrentBlock) {
            offsetFromBlockStart = 0;
            position = new GeneratorPosition(containerIndex - 1, 1);
            break;
          }
        }
      }
    }

    assert('connot find item', block !== this._itemMap);

    return [
      block,
      position,
      offsetFromBlockStart,
      correctIndex
    ];
  }

  private doLinearSearch(
    match: (item: unknown, container: object) => boolean
  ): [boolean, object | null, unknown | null, number] {

    let
      item: unknown | null = null,
      container: object | null = null,
      itemIndex: number = 0,
      startBlock: ItemBlock,
      block: ItemBlock,
      offset: number,
      endOffset: number,
      index: number = 0,
      rib: RealizedItemBlock | null = null,
      startOffset: number;

    if (this._itemMap === null) {
      return this._notFound;
    }

    startBlock = this._itemMap.next;

    while (index <= this._startIndexForUIFromItem && startBlock !== this._itemMap) {
      index += startBlock.itemCount;
      startBlock = startBlock.next;
    }

    startBlock = startBlock.prev;
    index -= startBlock.itemCount;

    if (startBlock instanceof RealizedItemBlock) {
      rib = startBlock;
      startOffset = this._startIndexForUIFromItem - index;
      if (startOffset >= rib.itemCount) {
        startOffset = 0;
      }
    } else {
      startOffset = 0;
    }

    block = startBlock;
    offset = startOffset;
    endOffset = startBlock.itemCount;

    while (true) {
      if (rib !== null) {
        for (; offset < endOffset; ++offset) {
          if (match(
            rib.itemAt(offset),
            rib.containerAt(offset)
          )) {
            item = rib.itemAt(offset);
            container = rib.containerAt(offset);
            this._startIndexForUIFromItem = index + offset;
            itemIndex += offset + this.getCount(block);
            return [true, container, item, itemIndex]
          }
        }

        if (block === startBlock && offset === startOffset) {
          break; // not found;
        }
      }

      index += block.itemCount;
      offset = 0;
      block = block.next;

      if (block === this._itemMap) {
        block = block.next;
        index = 0;
      }

      endOffset = block.itemCount;

      rib = block instanceof RealizedItemBlock
        ? block
        : null;

      if (block === startBlock) {
        if (rib !== null) {
          endOffset = startOffset;
        } else {
          break; //not found
        }
      }
    }

    return this._notFound;
  }

  private getCount(
    stop: ItemBlock,
  ) {

    let
      count: number = 0,
      start = this._itemMap,
      block: ItemBlock;

    if (start === null) {
      return count;
    }

    block = start.next;

    while (block !== stop) {
      count += block.itemCount;
      block = block.next;
    }

    return count;
  }

  private static Generator = class {
    constructor(
      private factory: ItemContainerGenerator,
      private position: GeneratorPosition,
      private direction: GeneratorDirection,
      allowStartAtRealizedItem: boolean
    ) {
      this._cachedState = new GeneratorState();

      this.factory.moveToPosition(
        this.position,
        this.direction,
        allowStartAtRealizedItem,
        this._cachedState,
      );

      if (this.factory.host instanceof ItemsControl) {
        this.factory.eventEmmiter.addEventListener(
          this,
          MapChangedEventArgs,
          this.onMapChanged
        );
      }

      this.factory.setStatus(GeneratorStatus.GeneratingContainers);
    }

    dispose() {
      if (this._disposed) {
        return;
      }

      if (
        this.factory.host instanceof ItemsControl
      ) {
        this.factory.eventEmmiter.removeEventListener(
          this,
          MapChangedEventArgs,
          this.onMapChanged
        );
      }

      this.factory._generator = null;
      this.factory.setStatus(GeneratorStatus.ContainersGenerated);

      //@ts-ignore
      this.factory = null;

      this._disposed = true;
    }

    generateNext(
      stopAtRealized: boolean
    ): [object | null, boolean] {
      let
        isNewlyRealized = false,
        container: object | null = null,
        items: ItemCollection,
        itemIndex: number,
        isf: boolean,
        item: unknown,
        uBlock: UnrealizedItemBlock;

      while (container === null) {
        items = this.factory.itemsInternal;
        itemIndex = this._cachedState.index;
        isf = this.direction === GeneratorDirection.Forward;

        if (this._cachedState.block === this.factory._itemMap) {
          this._done = true;
        }

        if (!(this._cachedState.block instanceof UnrealizedItemBlock) && stopAtRealized) {
          this._done = true;
        }

        if (!(0 <= itemIndex && itemIndex < items.count)) {
          this._done = true;
        }

        if (this._done) {
          return [null, isNewlyRealized = false];
        }

        if (this._cachedState.block instanceof UnrealizedItemBlock) {
          item = items.objectAt(itemIndex);
          uBlock = this._cachedState.block;
          isNewlyRealized = true;
          container = this.factory.host.containerForItem(item);
          if (container) {
            ItemContainerGenerator.LinkContainerToItem(
              container,
              item,
              this.factory.host
            );

            this.factory.realize(
              uBlock,
              this._cachedState.offset,
              item,
              container
            )
          }
        } else {
          isNewlyRealized = false;
          container = (
            this._cachedState.block as RealizedItemBlock
          ).containerAt(this._cachedState.offset)
        }

        this._cachedState.index = itemIndex;

        if (isf) {
          this._cachedState.block?.moveForward(this._cachedState, true);
        } else {
          this._cachedState.block?.moveBackward(this._cachedState, true);
        }
      }
      return [container, isNewlyRealized];
    }

    onMapChanged(
      sender: ItemContainerGenerator,
      args: MapChangedEventArgs
    ) {
      const {
        block,
        offset,
        count,
        newBlock,
        newOffset,
        deltaCount
      } = args;

      if (!args) return;

      if (this.factory !== sender) return;


      if (block !== null) {
        if (
          block === this._cachedState.block &&
          offset <= this._cachedState.offset &&
          this._cachedState.offset < offset + count
        ) {
          this._cachedState.block = newBlock;
          this._cachedState.offset += newOffset - offset;
          this._cachedState.count += deltaCount;
        }
      } else if (offset > 0) {
        if (
          offset < this._cachedState.count || (
            offset === this._cachedState.count &&
            newBlock !== null &&
            newBlock !== this._cachedState.block
          )
        ) {
          this._cachedState.count += count;
          this._cachedState.index += count;
        } else if (
          offset < this._cachedState.count + this._cachedState.offset
        ) {
          this._cachedState.offset += count;
          this._cachedState.index += count;
        } else if (
          offset === this._cachedState.count + this._cachedState.offset
        ) {
          if (count > 0) {
            this._cachedState.offset += count;
            this._cachedState.index += count;
          } else if (this._cachedState.offset === this._cachedState.block?.itemCount) {
            this._cachedState.block = this._cachedState.block?.next;
            this._cachedState.offset = 0;
          }
        }
      } else {
        this._cachedState.block = newBlock;
        this._cachedState.offset += this._cachedState.count;
        this._cachedState.count = 0;
      }
    }

    private _disposed: boolean = false
    private _done: boolean = false
    private _cachedState: GeneratorState
  }

  private setStatus(newStatus: GeneratorStatus) {
    let
      oldStatus: GeneratorStatus | null;

    if (this._status !== newStatus) {
      oldStatus = this._status;
      this._status = newStatus;

      this.eventEmmiter.emitEvent(
        this,
        GeneratorStatusChangedEventArgs,
        oldStatus,
        newStatus
      );
    }
  }

  private _eventEmmiter?: IEventEmmiter
  private _status: GeneratorStatus | null = null;
  private _generator: Generator | null = null;
  private _itemMap: ItemBlock | null = null;
  private _isDisposed: boolean = false
  private _startIndexForUIFromItem: number = 0;
  private _notFound: [
    boolean,
    object | null,
    unknown | null,
    number
  ] = [false, null, null, -1];
}

type Generator = {
  generateNext: (stopAtRealized: boolean) => [
    /*container       */ object | null,
    /*isNewlyRealized */ boolean
  ],
  onMapChanged: (sender: ItemContainerGenerator, args: MapChangedEventArgs | null) => void
} & IDisposable

class GeneratorState {
  public index: number = 0;
  public offset: number = 0;
  public count: number = 0;
  public block: ItemBlock | null = null
}

class ItemBlock {
  public prev!: ItemBlock;
  public next!: ItemBlock;
  public itemCount: number

  constructor() {
    this.itemCount = 0;
  }

  static BlockSize = 16;

  get containerCount() {
    return Number.MAX_SAFE_INTEGER;
  }

  containerAt(_index: number): null | {} {
    return null;
  }

  itemAt(_index: number): null | any {
    return null;
  }

  /**
   * [prev.prev] ← [prev] → [this] → [prev.next]               
   * @param { ItemBlock} prev
   */
  insertAfter(prev: ItemBlock) {
    this.next = prev.next;
    this.prev = prev;
    this.prev.next = this;
    this.next.prev = this;
  }

  /**
   * [prev.next] ← [this] ← [next] → [next.next]
   * @param { ItemBlock} prev
   */
  insertBefore(next: ItemBlock) {
    this.insertAfter(next.prev)
  }

  remove() {
    this.prev.next = this.next;
    this.next.prev = this.prev;
  }

  moveForward(
    state: GeneratorState,
    allowMovePastRealizedItem: boolean,
    count: number = 1
  ): number {
    if (this.isMovedAllowed(allowMovePastRealizedItem)) {
      if (count < this.itemCount - state.offset) {
        state.offset += count;
      } else {
        count = this.itemCount - state.offset || count;
        state.block = this.next;
        state.offset = 0;
        state.count += this.itemCount;
      }
      state.index += count;
    }
    return count;
  }

  moveBackward(
    state: GeneratorState,
    allowMovePastRealizedItem: boolean,
    count: number = 1
  ) {
    if (this.isMovedAllowed(allowMovePastRealizedItem)) {
      if (count <= state.offset) {
        state.offset -= count;
      } else {
        count = state.offset + 1;
        state.block = this.prev;
        state.offset = state.block.itemCount - 1;
        state.count -= state.block.itemCount
      }
    }
    return count;
  }

  isMovedAllowed(allowMovePastRealizedItem: boolean) {
    return allowMovePastRealizedItem;
  }
}

class UnrealizedItemBlock extends ItemBlock {
  get containerCount() {
    return 0;
  }

  isMovedAllowed(_allowMovePastRealizedItem: boolean) {
    return true;
  }
}

class RealizedItemBlock extends ItemBlock {
  constructor() {
    super();

    this.entry = Array<BlockEntry>(ItemBlock.BlockSize)
  }

  entry: Array<BlockEntry>;

  get containerCount() {
    return this.itemCount;
  }

  containerAt(index: number) {
    return this.entry[index].container;
  }

  itemAt(index: number) {
    return this.entry[index].item
  }

  copyEntries(
    src: RealizedItemBlock,
    offset: number,
    count: number,
    newOffset: number
  ) {
    let
      //left-to-right || right-to-left
      ltr = offset > newOffset,
      k = ltr ? 0 : count - 1,
      //if left-to-right = true 1 otherwise -1*/
      inc = ~~ltr - 1 | 1;

    for (; ltr ? k < count : k >= 0; k += inc) {
      this.entry[newOffset + k] = src.entry[offset + k].copy()
    }

    if (src != this) {
      src.clearEntries(offset, count);
    } else if (ltr) {
      src.clearEntries(newOffset + count, offset - newOffset);
    } else {
      src.clearEntries(offset, newOffset - offset);
    }
  }

  clearEntries(offset: number, count: number) {
    for (let i = 0; i < count; ++i) {
      // 1) this.entry[offset + i] = null
      // 2) delete this.entry[offset + i];
      this.entry.splice(offset + i, 1);
    }
  }

  realizeItem(
    index: number,
    item: any,
    container: any
  ) {
    this.entry[index] = new BlockEntry(item, container);
  }

  offsetOfItem(item: any) {
    for (let k = 0; k < this.itemCount; ++k) {
      if (item === this.entry[k].item) {
        return k;
      }
    }
    return -1;
  }
}

class BlockEntry {
  constructor(
    public item: any,
    public container: any
  ) { }
  copy() {
    return new BlockEntry(this.item, this.container);
  }
}