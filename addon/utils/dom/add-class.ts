
/**
 * Add class to element or array of elements
 * @param source Element | Array<Element>
 * @param classNames string. Names of classes separated by a space
 */
export default function addClass(source: Element | Array<Element>, classNames: string) {
  const
    arrayOfElements = source instanceof Array
      ? source.slice()
      : [source];

  arrayOfElements.map(element => {
    if (element.classList) {
      classNames.replace(/\./g, "").split(' ').forEach(className => element.classList.add(className));
    }
    else {
      element.className += ' ' + classNames;
    }
  });
}
