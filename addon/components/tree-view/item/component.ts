import ItemsControl, { IItemsControlArgs } from 'ember-ux-core/components/items-control'
import bem, { ClassNamesBuilder } from 'ember-ux-core/utils/bem';
// @ts-ignore
import layout from './template';

export interface ITreeViewItemArgs extends IItemsControlArgs {

}

export class TreeViewItem extends ItemsControl<ITreeViewItemArgs> {
  constructor(
    owner: unknown,
    args: ITreeViewItemArgs,
    props?: ITreeViewItemArgs
  ) {
    super(owner, args, props);
  }

  public get classNamesBuilder()
    : ClassNamesBuilder {
    return bem('tree-view');
  }

  public get classNames()
    : string {
    return `${this.classNamesBuilder}`;
  }


  createContainerForItem(
    item: unknown
  ): unknown {
    throw new Error("Method not implemented.");
  }

  prepareItemContainer(
    container: unknown
  ): void {
    throw new Error("Method not implemented.");
  }

  clearContainerForItem(
    container: unknown,
    item: unknown
  ): void {
    throw new Error("Method not implemented.");
  }

  linkContainerToItem(
    container: unknown,
    item: unknown
  ): void {
    throw new Error("Method not implemented.");
  }

  readItemFromContainer(
    container: unknown
  ): unknown {
    throw new Error("Method not implemented.");
  }
}

export default TreeViewItem.RegisterTemplate(layout);