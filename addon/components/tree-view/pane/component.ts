import Panel, { IPanelArgs } from 'ember-ux-core/components/panel';
import { ClassNamesBuilder } from 'ember-ux-core/utils/bem';
// @ts-ignore
import layout from './template';


interface ITreeViewPaneArgs extends IPanelArgs {
  isExpanded: boolean,
  classNamesBuilder: ClassNamesBuilder
}

export class TabPane extends Panel<ITreeViewPaneArgs> {
  constructor(
    owner: any,
    args: ITreeViewPaneArgs,
    props?: ITreeViewPaneArgs
  ) {
    super(owner, args, props);
  }

  public get classNamesBuilder() {
    return this.args.classNamesBuilder;
  }

  public get classNames() {
    return this.classNamesBuilder('container', {
      [`$visible`]: this.args.isExpanded
    })
  }
}

export default TabPane.RegisterTemplate(layout);
