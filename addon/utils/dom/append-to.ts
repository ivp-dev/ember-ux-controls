/**
 * Append an element to a target. 
 * If referenced element exists, the element will be added before the referenced element.
 
 * @param target add to
 * @param element to add
 * @param reference referenced 
 */

export default function appendTo(
  target: Node,
  element: Node,
  reference?: Node | null
) {
  target.insertBefore(element, reference || null);
}
