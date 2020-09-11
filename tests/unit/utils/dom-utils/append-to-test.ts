import appendTo from 'ember-ux-controls/utils/dom/append-to';
import { module, test } from 'qunit';

module('Unit | Utility | dom-utils/append-to', function() {

  // Replace this with your real tests.
  test('should append childs to the target', function(assert) {
    const
      root = document.createElement("div"),
      first = document.createTextNode("first"),
      last = document.createTextNode("last"),
      between = document.createTextNode("between");

    // append last node
    appendTo(root, last);
    // append first node before last
    appendTo(root, first, last);
    // appdend between node before last, should be in the middle
    appendTo(root, between, last);

    // check assumptions 
    assert.ok(root.childNodes[0] === first);
    assert.ok(root.childNodes[1] === between);
    assert.ok(root.childNodes[2] === last);
  });
});
