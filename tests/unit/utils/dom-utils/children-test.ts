import children from 'ember-ux-controls/utils/dom/children';
import { module, test } from 'qunit';

module('Unit | Utility | dom-utils/children', function() {

  const
      root = document.createElement("div"),
      first = document.createElement("div"),
      last = document.createElement("div"),
      between = document.createElement("div"),
      selector = "between";

    between.classList.add(selector)

    // append childs
    root.appendChild(first); 
    root.appendChild(between);
    root.appendChild(last);
    
  test('should get all child nodes of the element', function(assert) {
  
    const 
      childs = children(root);

    
    assert.equal(childs.length, 3, "should be 3 nodes in result");
    assert.ok(childs[0] === first, "first element of the array should be equal with the first");
    assert.ok(childs[1] === between, "second element of the array should be equal with the between");
    assert.ok(childs[2] === last, "last element of the array should be equal with the last");
  });

  test('should get all child nodes of the element by class selector', function(assert) {
    const 
      childs = children(root, `.${selector}`);

    assert.ok(childs.length === 1, "should be 1 nodes");
    assert.ok(childs[0] === between, "first element of the array should be equal with the between");
    
  });
});
