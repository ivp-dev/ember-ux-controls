export default function removeBetween(
  root: Node,
  firstNode: Node,
  lastNode: Node
) {
  let
    sibling = firstNode.nextSibling;

  while (sibling !== null && sibling !== lastNode) {
    const
      nextSibling = sibling.nextSibling;

    root.removeChild(sibling);
    
    sibling = nextSibling;
  }
}
