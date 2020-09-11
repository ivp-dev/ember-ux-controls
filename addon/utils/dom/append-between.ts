import removeChilds from './remove-childs';
import appendTo from './append-to';

/**
 * Move nodes between first and last to the target 
 * @param target Node
 * @param firstNode Node
 * @param lastNode Node
 * @param replace boolen 
 */
export default function appendBetween(
  target: Node,
  firstNode: Node,
  lastNode: Node,
  replace = false
) {
  if (replace) {
    removeChilds(target);
  }

  let
    sibling = firstNode.nextSibling;

  while (sibling != null && sibling !== lastNode) {
    const 
      nextSibling = sibling.nextSibling;
      
    appendTo(target, sibling);

    sibling = nextSibling;
  }
}
