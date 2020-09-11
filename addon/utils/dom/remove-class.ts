/**
 * Remove class from element or array of elements
 * @param source Element | Array<Element>
 * @param classNames string. Names of classes separated by a space
 */
export default function removeClass(source: Element | Array<Element>, classNames: string) {
  const
    arrayOfElements = source instanceof Array
      ? source.slice()
      : [source],
    classList = classNames.replace(/\./g, "").split(' ');
  arrayOfElements.map(element => {
    if (element.classList) {
      classList.forEach(className =>
        element.classList.remove(className)
      );
    }
    else {
      const
        existedClasses = element.className.split(' ');

      classList.forEach(className => {
        const
          index = existedClasses.indexOf(className);

        if (index > -1) {
          existedClasses.splice(index, 1);
        }
      });

      element.className = existedClasses.join(' ');
    }
  });


}
