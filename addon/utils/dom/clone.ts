export default function clone(element: Node, deep?: boolean) : Node {
  return element.cloneNode(deep)
}
