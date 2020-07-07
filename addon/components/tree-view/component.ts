import SelectItemsControl, { ISelectItemsControlArgs } from 'ember-ux-core/components/select-items-control'
import bem, { ClassNamesBuilder } from 'ember-ux-core/utils/bem';
// @ts-ignore
import layout from './template';

export interface ITreeViewArgs extends ISelectItemsControlArgs {

}

export class TreeView extends SelectItemsControl<ITreeViewArgs> {
  constructor(
    owner: unknown,
    args: ITreeViewArgs,
    props?: ITreeViewArgs
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

export default TreeView.RegisterTemplate(layout);