// @ts-ignore
import layout from './template';
import UXElement, { IUXElementArgs } from 'ember-ux-controls/common/classes/ux-element';

interface DataTableGroupArgs extends IUXElementArgs{

}

export default class DataTableGroup extends UXElement<DataTableGroupArgs> {

}

DataTableGroup.RegisterTemplate(layout)