export default function hasClass(source: Element | Array<Element>, className: string): boolean {
  let
    elements = source instanceof Element
      ? [source]
      : source,
    tests = elements.map(element =>
      element.classList
        ? element.classList.contains(className)
        : new RegExp('(^| )' + className + '( |$)', 'gi').test(element.className));

  return tests.every(test => test);
}
