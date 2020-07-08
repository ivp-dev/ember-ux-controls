import UXElement, { IUXElementArgs } from 'ember-ux-core/components/ux-element';
import { ClassNamesBuilder } from 'ember-ux-core/utils/bem';
// @ts-ignore
import layout from './template';

interface IPresenterArgs extends IUXElementArgs {
  isExpanded: boolean,
  hasItems: boolean,
  classNamesBuilder: ClassNamesBuilder
}

export class Presenter extends UXElement<IPresenterArgs> {}

export default Presenter.RegisterTemplate(layout);
