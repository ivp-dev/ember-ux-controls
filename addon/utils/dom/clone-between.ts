import removeChilds from './remove-childs';
import appendTo from './append-to';
import clone from './clone';

/**
 * Clone and move nodes between first and last to the target.
 * If replace is true, children of the target will be removed.
 * If deep is true, the copy also includes the node's descendants.
 * @param target Node
 * @param firstNode Node
 * @param lastNode Node
 * @param replace boolean 
 * @param deep boolean
 */
export default function cloneBetween(
  target: Node,
  firstNode: Node,
  lastNode: Node,
  replace?: boolean,
  deep?: boolean
) {
  if (replace) {
    removeChilds(target);
  }

  let
    sibling = firstNode.nextSibling;

  while (sibling != null && sibling !== lastNode) {
    const 
      nextSibling = sibling.nextSibling;
      
    appendTo(target, clone(sibling, deep));

    sibling = nextSibling;
  }
}
