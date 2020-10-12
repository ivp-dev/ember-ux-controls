import ItemContainerGenerator, {
  GeneratorPosition,
  ItemContainerGeneratorChangedEventArgs
} from 'ember-ux-controls/common/classes/-private/item-container-generator';
import UXElement, { IUXElementArgs } from './ux-element';
import { GeneratorDirection } from 'ember-ux-controls/common/types';
import { A } from '@ember/array';
import { ItemCollectionActions } from 'ember-ux-controls/common/types';
import using from 'ember-ux-controls/utils/using';
import { assert } from '@ember/debug';
import MutableArray from '@ember/array/mutable';
import { reads } from '@ember/object/computed';
import { notifyPropertyChange } from '@ember/object';
import ItemCollection from 'ember-ux-controls/common/classes/-private/item-collection';

export interface IPanelArgs extends IUXElementArgs {
  hasItemsSource?: boolean
  itemContainerGenerator?: ItemContainerGenerator
  addChild: (child: unknown) => void
  removeChild: (child: unknown) => void
}

export default class Panel<TA extends IPanelArgs> extends UXElement<TA> {
  constructor(
    owner: any,
    args: TA
  ) {
    super(owner, args);

    if (!this.hasItemsSource) {
      this.ensureGenerator();
    }
  }

  @reads('args.itemContainerGenerator.view')
  public view?: ItemCollection

  @reads('args.hasItemsSource')
  public hasItemsSource?: boolean

  @reads('args.addChild')
  public addChild?: (child: unknown) => void

  @reads('args.removeChild')
  public removeChild?: (child: unknown) => void

  public get children()
    : MutableArray<object> {

    if (this.hasItemsSource) {
      this.ensureGenerator();
    }

    if (!this._children) {
      this._children = this.createChildren(); // TODO: need to verify
    }

    return this._children;
  }

  private get itemContainerGenerator() {
    return this._itemContainerGenerator;
  }

  private set itemContainerGenerator(
    value: ItemContainerGenerator | undefined
  ) {
    if (this._itemContainerGenerator !== value) {
      this._itemContainerGenerator = value;
      notifyPropertyChange(this, 'itemContainerGenerator');
    }
  }

  public willDestroy()
    : void {
    if (this.itemContainerGenerator) {
      this.itemContainerGenerator.removeEventListener(this,
        ItemContainerGeneratorChangedEventArgs,
        this.onItemContainerGeneratorChanged
      );

      this.itemContainerGenerator = void 0;
    }

    super.willDestroy();
  }

  protected onItemsChangedInternal(
    args: ItemContainerGeneratorChangedEventArgs
  ): boolean {
    switch (args.action) {
      case ItemCollectionActions.Add:
        this.addChildren(
          args.position,
          args.itemCount
        )
        break;
      case ItemCollectionActions.Remove:
        this.removeChildren(
          args.position,
          args.itemUICount
        );
        break;
      case ItemCollectionActions.Replace:
        this.replaceChildren(
          args.position,
          args.itemCount,
          args.itemUICount
        );
    }
    return true;
  }

  private ensureGenerator() {
    if (!this.itemContainerGenerator) {
      this.connectToGenerator();
      this.ensureEmptyChildren();
      this.generateChildren();
    }
  }

  private ensureEmptyChildren()
    : void {
    if (!this._children) {
      this._children = this.createChildren();
    }
  }

  private connectToGenerator()
    : void {
    this.itemContainerGenerator = this.args.itemContainerGenerator;

    if (!this.itemContainerGenerator) {
      return;
    }

    this.itemContainerGenerator.removeAll();

    this.itemContainerGenerator.addEventListener(
      this,
      ItemContainerGeneratorChangedEventArgs,
      this.onItemContainerGeneratorChanged
    );
  }

  private generateChildren()
    : void {
    const
      containerGenerator = this.itemContainerGenerator;

    if (!containerGenerator) {
      return;
    }

    using(containerGenerator.startAt(
      new GeneratorPosition(-1, 0),
      GeneratorDirection.Forward
    ), (generator) => {
      let
        child: object | null;

      for (
        [child] = generator.generateNext(true);
        child !== null;
        [child] = generator.generateNext(true)
      ) {
        this.addIfItemsHost(child);
        containerGenerator.prepareItemContainer(child);
      }
    });
  }

  private onItemContainerGeneratorChanged(
    _sender: ItemContainerGenerator,
    args: ItemContainerGeneratorChangedEventArgs
  ): void {
    this.onItemsChangedInternal(args);
  }

  // if panel is not items-host, children no need
  private addIfItemsHost(
    child: object,
    index: number = -1
  ): boolean {
    if (!this.hasItemsSource) {
      return false;
    }

    if (index === -1) {
      this.children.pushObject(child);
    } else {
      this.children.insertAt(index, child);
    }

    return true;
  }

  private replaceChildren(
    position: GeneratorPosition,
    itemCount: number,
    containerCount: number
  ): void {
    const
      containerGenerator = this.itemContainerGenerator;

    assert(
      'Panel expect replace to affect only realzied containers',
      itemCount === containerCount
    );

    if (!containerGenerator) {
      return;
    }

    using(containerGenerator.startAt(
      position,
      GeneratorDirection.Forward,
      true
    ), (generator) => {
      let
        child: object | null,
        isNewlyRealized: boolean,
        i: number;

      for (i = 0; i < itemCount; ++i) {
        [child, isNewlyRealized] = generator.generateNext(false)

        assert('panel expect replace to affect only realzied items', !isNewlyRealized)

        if (child !== null && !isNewlyRealized) {
          this.addIfItemsHost(child, position.index + i);
          containerGenerator.prepareItemContainer(child);
        } else {
          //TODO: something wrong
        }
      }
    });
  }

  // try to add
  private addChildren(
    position: GeneratorPosition,
    addCount: number
  ): void {
    const
      containerGenerator = this.itemContainerGenerator;

    if (containerGenerator) {
      using(containerGenerator.startAt(
        position,
        GeneratorDirection.Forward
      ), (generator) => {
        let
          i: number,
          child: object | null;

        for (i = 0; i < addCount; ++i) {
          [child] = generator.generateNext(true);
          if (child !== null) {
            this.children.insertAt(position.index + 1 + i, child);
            containerGenerator.prepareItemContainer(child);
          } else {
            throw new Error('container should be generated')
            //TODO: something wrong
          }
        }
      });
    }
  }

  private removeChildren(
    position: GeneratorPosition,
    removeCount: number
  ): void {
    this.children.replace(position.index, removeCount, []);
  }

  private createChildren(
    source: Array<any> = []
  ): MutableArray<any> {
    return A(source);
  }

  private _itemContainerGenerator?: ItemContainerGenerator
  private _children?: MutableArray<object>
}
