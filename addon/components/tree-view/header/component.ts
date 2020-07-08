import UXElement, { IUXElementArgs } from 'ember-ux-core/components/ux-element';
import { ClassNamesBuilder } from 'ember-ux-core/utils/bem';
// @ts-ignore
import layout from './template';

interface IHeaderArgs extends IUXElementArgs {
  header?: unknown
  headerTemplateName?: string
  expanderTemplateName?: string
  classNamesBuilder?: ClassNamesBuilder
  hasItems?: boolean,
  isExpanded?: boolean,
  toggleExpander?: (event: Event) => void
  select: () => void
}

export class Header extends UXElement<IHeaderArgs> {
  public get header() {
    return (
      this.args?.header ??
      this.props?.header
    );
  }

  public get headerTemplateName() {
    return (
      this.args?.headerTemplateName ??
      this.props?.headerTemplateName
    );
  }

  public get expanderTemplateName() {
    return (
      this.args?.expanderTemplateName ??
      this.props?.expanderTemplateName
    );
  }

  public get classNamesBuilder() {
    return (
      this.args.classNamesBuilder ?? 
      this.props?.classNamesBuilder
    );
  }

  public get hasItems() {
    return (
      this.args.hasItems ?? 
      this.props?.hasItems
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
        [`$active`]: this.hasItems,
        [`$expanded`]: this.isExpanded
      })}`;
    }

    return ''
  }
}

export default Header.RegisterTemplate(layout);