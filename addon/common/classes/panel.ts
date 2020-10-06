import ItemContainerGenerator, {
  GeneratorPosition,
  ItemContainerGeneratorChangedEventArgs
} from 'ember-ux-controls/common/classes/-private/item-container-generator';
import UXElement, { IUXElementArgs } from './ux-element';
import ItemsControl from './items-control';
import { GeneratorDirection } from 'ember-ux-controls/common/types';
import { A } from '@ember/array';
import NativeArray from "@ember/array/-private/native-array";
import { ItemCollectionActions } from 'ember-ux-controls/common/types';
import using from 'ember-ux-controls/utils/using';
import { assert } from '@ember/debug';

export interface IPanelArgs extends IUXElementArgs { }

export default class Panel<TA extends IPanelArgs = {}> extends UXElement<TA> {
  constructor(
    owner: any,
    args: TA
  ) {
    super(owner, args);

    let
      parentElement = this.visualParent;

    if (this.isItemsHost) {
      (<ItemsControl>parentElement).itemsHost = this;
    } else {
      // we should to create the generator here because we 
      // will not access to the children property in a template
      // where the generator initializes in case of 
      // is-items-host:true
      this.ensureGenerator();
    }
  }

  public get isItemsHost()
    : boolean {
    return (
      this.visualParent instanceof ItemsControl && this.visualParent.hasItemsSource
    );
  }

  public get children()
    : NativeArray<object> {
    return this.internalChildren;
  }

  protected get parentItemsControl()
    : ItemsControl | null {
    if (this.visualParent instanceof ItemsControl) {
      return this.visualParent;
    }

    return null;
  }

  protected get internalChildren()
    : NativeArray<object> {
    if (this.isItemsHost) {
      this.ensureGenerator();
    }

    if (!this._children) {
      this._children = this.createChildren(); // TODO: need to verify
    }

    return this._children;
  }

  public addChild(
    child: object
  ): void {
    if (!child) {
      throw new Error('child cant be null');
    }

    if (this.isItemsHost) {
      throw new Error('can not add child if itemssource was set')
    }

    this.children.pushObject(child);
  }

  public willDestroy()
    : void {

    if (this._itemContainerGenerator) {
      this._itemContainerGenerator.removeEventListener(this,
        ItemContainerGeneratorChangedEventArgs,
        this.onItemContainerGeneratorChanged
      );

      this._itemContainerGenerator.dispose();
      this._itemContainerGenerator = void 0;
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

  private ensureGenerator()
    : void {
    if (typeof this._itemContainerGenerator === 'undefined') {
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

    if (this.visualParent instanceof ItemsControl) {
      this._itemContainerGenerator = this.visualParent.itemContainerGenerator;
      if (this._itemContainerGenerator) {
        this._itemContainerGenerator.removeAll();
        this._itemContainerGenerator.addEventListener(this,
          ItemContainerGeneratorChangedEventArgs,
          this.onItemContainerGeneratorChanged
        );
      }
    }
  }

  private generateChildren()
    : void {
    const
      containerGenerator = this._itemContainerGenerator;

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
        //this.children.pushObject(child); // childrent should exist 
        containerGenerator.prepareItemContainer(child);
      }
    });

  }

  private onItemContainerGeneratorChanged(
    _: ItemContainerGenerator,
    args: ItemContainerGeneratorChangedEventArgs
  ): void {
    assert(
      'Panel._itemContainerGenerator can`t be null in this context',
      this._itemContainerGenerator !== null
    );

    this.onItemsChangedInternal(args);
  }

  // if panel is not items-host, children no need
  private addIfItemsHost(
    child: object,
    index: number = -1
  ): void {
    if (!this.isItemsHost) {
      return;
    }

    if (index === -1) {
      this.children.pushObject(child);
    } else {
      this.children[index] = child;
    }
  }

  private replaceChildren(
    position: GeneratorPosition,
    itemCount: number,
    containerCount: number
  ): void {
    const
      containerGenerator = this._itemContainerGenerator;

    assert(
      'panel expect replace to affect only realzied containers',
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
      containerGenerator = this._itemContainerGenerator;

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
    this.internalChildren.replace(position.index, removeCount, []);
  }

  private createChildren(
    source: Array<any> = []
  ): NativeArray<any> {
    return A(source);
  }

  private _children?: NativeArray<object>
  private _itemContainerGenerator?: ItemContainerGenerator
}
