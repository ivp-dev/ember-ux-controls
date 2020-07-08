import ItemsControl, {
  IItemsControlArgs,
} from 'ember-ux-core/components/items-control'
import { camelize } from '@ember/string';
import bem, { ClassNamesBuilder } from 'ember-ux-core/utils/bem';
import {
  Axes,
  Side,
  Size
} from 'ember-ux-core/common/types';
import { Pane } from './pane/component';
import SplitViewPaneModel from 'ember-ux-controls/common/classes/split-view-pane-model';
import { IContentElement } from 'ember-ux-controls/common/types';

// @ts-ignore
import layout from './template';

export interface ISplitViewArgs extends IItemsControlArgs {
  axis?: Axes
  responsive?: boolean,
  fluent?: boolean,
  barSize?: number,
  sizeTarget?: Size,
  maxSizeTarget?: Size,
  sideTarget?: Side,
  sideOrigin?: Side,
  minPaneSize?: number,
  sizes?: Array<number>,
  minPaneSizes?: Array<number>,
  getContent?: (item: unknown) => unknown
  onSizeChanged?: (sizes: Array<number>) => void
}

export class SplitView extends ItemsControl<ISplitViewArgs> {
  constructor(
    owner: any,
    args: ISplitViewArgs,
    props?: ISplitViewArgs
  ) {
    super(owner, args, props);
  }

  public get itemTemplateName() {
    return (
      super.itemTemplateName ??
      'split-view/pane'
    );
  }

  public get classNamesBuilder()
    : ClassNamesBuilder {
    return bem(`split-view`, `$${this.axis}`);
  }

  public get classNames()
    : string {
    return `${this.classNamesBuilder}`;
  }

  public get responsive()
    : boolean {
    return (
      this.args.responsive ??
      this.props?.responsive ??
      false
    );
  }

  public get fluent()
    : boolean {
    return (
      this.args.fluent ??
      this.props?.fluent ??
      false
    );
  }

  public get barSize()
    : number {
    const
      barSize = 2;

    return (
      this.args.barSize ??
      this.props?.barSize ??
      barSize
    );
  }

  public get minPaneSize()
    : number {
    const
      minPaneSize = 0;

    return (
      this.args.minPaneSize ??
      this.props?.minPaneSize ??
      minPaneSize
    );
  }

  public get axis()
    : Axes {
    return (
      this.args.axis ??
      this.props?.axis ??
      Axes.X
    );
  }

  public get maxSizeTarget()
    : string {
    return camelize('max-' + this.sizeTarget);
  }

  public get sideOrigin()
    : Side {
    return this.axis === Axes.X
      ? Side.Left
      : Side.Top;
  }

  public get sideTarget()
    : Side {
    return this.axis === Axes.X
      ? Side.Right
      : Side.Bottom;
  }

  public get sizeTarget()
    : Size {
    return this.axis === Axes.X
      ? Size.Width
      : Size.Height;
  }

  public itemItsOwnContainer(
    item: unknown
  ): item is Pane {
    let
      result: boolean

    result = item instanceof Pane;

    return result;
  }

  public createContainerForItem()
    : SplitViewPaneModel {
    return new SplitViewPaneModel(this);
  }

  public prepareItemContainer(
    container: SplitViewPaneModel
  ): void {
    let
      item: unknown;

    item = this.readItemFromContainer(container)

    if (this.itemItsOwnContainer(item)) {
      return;
    }

    if (isContentElement(item)) {
      container.content = item.content;
    } else if (
      typeof this.args.getContent === 'function'
    ) {
      container.content = this.args.getContent(item)
    } else {
      throw new Error(`Can't extract header and content from item`);
    }
  }

  public clearContainerForItem(
    container: SplitViewPaneModel
  ): void {
    container.item = null;
    container.content = null;
  }

  public linkContainerToItem(
    container: SplitViewPaneModel,
    item: unknown
  ): void {
    container.item = item;
  }

  public readItemFromContainer(
    container: SplitViewPaneModel
  ): unknown {
    return container.item;
  }
}

export default SplitView.RegisterTemplate(layout)

function isContentElement(
  obj: unknown
): obj is IContentElement {
  return (
    typeof (<IContentElement>obj).content !== 'undefined'
  );
}