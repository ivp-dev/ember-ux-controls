/**
 * Return child nodes of the element
 * @param source 
 * @param selector 
 */

export default function children(source: Element | Array<Element>, selector?: string) : Array<Node> {
  if (source instanceof Array) {
    return [].concat.apply([], source.map(e => childrenInternal(e, selector)));
  } else {
    return childrenInternal(source, selector);
  }
}

function childrenInternal(element: Element, selector?: string) : Array<Element>{
  if (selector) {
    return [...element.children].filter(c => c.matches(selector));
  }

  return [...element.children];
}
