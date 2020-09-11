/**
 * Get boundin client rectangle
 * @param source Element
 */
export default function rect(source: Element) : DOMRect {
  return source.getBoundingClientRect();
}
