export default function find(
  parent: ParentNode | Array<ParentNode>,
  selector: string
): Array<Element> {
  if (parent instanceof Array) {
    return [].concat.apply([], parent.map(e => findInternal(e, selector)));
  }
  return findInternal(parent, selector);
}

function findInternal(
  parent: ParentNode, selector: string
): Array<Element> {
  const
    internalSelector = selector.startsWith('#')
      ? `[id^='${selector.slice(1)}']`
      : `${selector}`;

  return Array.prototype.slice.call(
    parent.querySelectorAll(internalSelector)
  );
}

