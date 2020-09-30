export default function css(
  elements: HTMLElement | Array<HTMLElement>,
  style: object
) {
  if (!(elements instanceof Array)) {
    elements = [elements];
  }

  elements.map(e => {
    for (const [key, value] of Object.entries(style)) {
      e.style.setProperty(key, value)
    }
  });
}