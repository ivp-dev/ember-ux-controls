export default function removeChields(target: Node | Array<Node>) {
  removeChieldsInternal(
    target instanceof Array ? target : [target]
  );
}

function removeChieldsInternal(root: Array<Node>) {
  root.forEach(element => {
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }
  })
}
