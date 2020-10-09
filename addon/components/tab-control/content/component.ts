// @ts-ignore
import layout from './template';
import UXElement, { IUXElementArgs } from 'ember-ux-controls/common/classes/ux-element';
import { reads } from '@ember/object/computed';



interface ITabControlContentArgs extends IUXElementArgs {
  content?: unknown
}

class TabControlContent extends UXElement<ITabControlContentArgs> {
  @reads('args.{content}')
  public content?: unknown
}

export default TabControlContent.RegisterTemplate(layout);