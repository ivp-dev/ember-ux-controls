import UXElement, { IUXElementArgs } from 'ember-ux-core/components/ux-element';
import { ClassNamesBuilder } from 'ember-ux-core/utils/bem'
import { ScrollPort } from '../component';
// @ts-ignore
import layout from './template';


interface IScreenArgs extends IUXElementArgs {
  classNamesBuilder?: ClassNamesBuilder
}

class Screen extends UXElement<IScreenArgs> {
  constructor(
    owner: any,
    args: IScreenArgs,
    props?: IScreenArgs
  ) {
    super(owner, args, props);
  }

  get classNamesBuilder() {
    if (this.parentElement instanceof ScrollPort) {
      return this.parentElement.classNamesBuilder;
    }

    return (
      this.args.classNamesBuilder ??
      this.props?.classNamesBuilder
    );
  }


  get classNames() {
    if (this.classNamesBuilder) {
      return this.classNamesBuilder('screen');
    }
    return '';
  }
}

export default Screen.RegisterTemplate(layout)