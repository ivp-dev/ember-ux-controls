import cloneBetween from 'ember-ux-controls/utils/dom/clone-between';
import { module, test } from 'qunit';

module('Unit | Utility | dom-utils/clone-between', function () {

  // Replace this with your real tests.
  test('should append to the target clone of the nodes between', function (assert) {
    const
      root = document.createElement("div"),
      first = document.createTextNode("first"),
      last = document.createTextNode("last"),
      between = document.createTextNode("between"),
      target = document.createElement("div");

    // append last node
    root.insertBefore(last, null);
    // append first node before last
    root.insertBefore(first, last);
    // appdend between node before last, should be in the middle
    root.insertBefore(between, last)


    // check assumptions 
    assert.ok(root.childNodes[0] === first);
    assert.ok(root.childNodes[1] === between);
    assert.ok(root.childNodes[2] === last);

    // append element between first and last to the target
    cloneBetween(target, first, last);

    // between element should now be append to target
    assert.equal(
      target.childNodes[0].textContent,
      "between",
      "between element should now be append to the target"
    );

    // root element should has only first and last element
    assert.ok(root.childNodes.length === 3, "root element should has only first and last element");
    assert.ok(root.childNodes[0] === first, "first in root should be equal the first element");
    assert.ok(root.childNodes[1] === between, "last in root should be equal the last element");
    assert.ok(root.childNodes[2] === last, "last in root should be equal the last element");
  });
});
