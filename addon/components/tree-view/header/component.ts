import UXElement, { IUXElementArgs } from 'ember-ux-core/components/ux-element';
import { ClassNamesBuilder } from 'ember-ux-core/utils/bem';
// @ts-ignore
import layout from './template';

interface IHeaderArgs extends IUXElementArgs {
  header?: unknown
  headerTemplateName?: string
  expanderTemplateName?: string
  classNamesBuilder?: ClassNamesBuilder
  hasChilds?: boolean,
  isExpanded?: boolean,
  isSelected?: boolean,
  toggleExpander?: (event: Event) => void
  select: () => void
}

export class Header extends UXElement<IHeaderArgs> {
  public get header() {
    return (
      this.args.header ??
      this.props?.header
    );
  }

  public get toggleExpander() {
    return (
      this.args.toggleExpander ??
      this.props?.toggleExpander
    );
  }

  public get isSelected() {
    return (
      this.args.isSelected ??
      this.props?.isSelected
    );
  }

  public get headerTemplateName() {
    return (
      this.args.headerTemplateName ??
      this.props?.headerTemplateName
    );
  }

  public get expanderTemplateName() {
    return (
      this.args.expanderTemplateName ??
      this.props?.expanderTemplateName
    );
  }

  public get classNamesBuilder() {
    return (
      this.args.classNamesBuilder ?? 
      this.props?.classNamesBuilder
    );
  }

  public get hasChilds() {
    return (
      this.args.hasChilds ?? 
      this.props?.hasChilds
    );
  }

  public get isExpanded() {
    return (
      this.args.isExpanded ?? 
      this.props?.isExpanded
    );
  }

  public get classNames()
    : string {
    if (this.classNamesBuilder) {
      return `${this.classNamesBuilder('header', {
        [`$active`]: this.hasChilds,
        [`$expanded`]: this.isExpanded
      })}`;
    }

    return ''
  }
}

export default Header.RegisterTemplate(layout);