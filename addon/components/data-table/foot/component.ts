// @ts-ignore
import layout from './template';
import UXElement, { IUXElementArgs } from 'ember-ux-controls/common/classes/ux-element';

interface IDataTableFootArgs extends IUXElementArgs { }

class DataTableFoot extends UXElement<IDataTableFootArgs> { }

export default DataTableFoot.RegisterTemplate(layout);