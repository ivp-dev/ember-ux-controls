export default function closest(element: Element, selector:string) {
  let 
    result: Array<Element> = [],
    node: Element | null = element;
  while(node) {
    if(node.matches(selector)) {
      result.push(node);
    }
    node = node.parentElement;
  }
  return result;
}
