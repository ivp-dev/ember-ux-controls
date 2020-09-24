type Callback = (node: Node) => boolean
type SelectorCallback = (selectors: string) => boolean

const matchFunction: SelectorCallback =
  Element.prototype.matches ||
  Element.prototype.webkitMatchesSelector;

//TODO: need test
export default function closest(
  element: Element,
  value: string | Callback | NodeList | Node | Element
): Element | Node | null {
  let
    current: Element | Node | null;

  current = element;

  function conditionFn(
    currentElement: Node
  ): boolean {
    if (!currentElement) {
      return currentElement;
    } else if (isString(value)) {
      return matchFunction.call(currentElement, value);
    } else if (isNodeList(value)) {
      return [...value].includes(currentElement);
    } else if (isElement(value)) {
      return value === currentElement;
    } else if (isCallback(value)) {
      return value(currentElement);
    }
    return false;
  }

  do {
    if (current instanceof SVGElement) {
      current = (
        current.correspondingUseElement ??
        current.correspondingElement
      )
    }

    if (conditionFn(current)) {
      return current;
    }

    current = current.parentElement ?? current.parentNode;
  } while (current && current !== document.body && current !== document);

  return null;
}

function isString(value: unknown)
  : value is string {
  return typeof value === 'string';
}

function isCallback(value: unknown)
  : value is Callback {
  return typeof value === 'function';
}

function isNodeList(value: unknown)
  : value is NodeList {
  return value instanceof NodeList;
}

function isElement(value: unknown)
  : value is Element {
  return value instanceof Element;
}