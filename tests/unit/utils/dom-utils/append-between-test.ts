import appendBetween from 'ember-ux-controls/utils/dom/append-between';
import { module, test } from 'qunit';

module('Unit | Utility | dom-utils/append-between', function () {

  // Replace this with your real tests.
  test('should move middle child to the target', function (assert) {
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
    assert.equal(root.childNodes[0], first);
    assert.equal(root.childNodes[1], between);
    assert.equal(root.childNodes[2], last);

    // append element between first and last to the target
    appendBetween(target, first, last);

    // between element should now be append to target
    assert.equal(target.childNodes[0], between, "between element should now be append to target");
    
    // root element should has only first and last element
    assert.equal(root.childNodes.length, 2, "root element should has only first and last element");
    assert.equal(root.childNodes[0], first, "first in root should be equal the first element");
    assert.equal(root.childNodes[1], last, "last in root should be equal the last element");
  });

  test('there is no any childs in root. Should no move anything', function (assert) {
    const
      root = document.createElement("div"),
      first = document.createTextNode("first"),
      last = document.createTextNode("last"),
      target = document.createElement("div");

    // append last node
    root.insertBefore(last, null);
    // append first node before last
    root.insertBefore(first, last);
    
    // check assumptions 
    assert.equal(root.childNodes[0], first);
    assert.equal(root.childNodes[1], last);

    // append element between first and last to the target
    appendBetween(target, first, last);

    // root element should has only first and last element
    assert.equal(root.childNodes.length, 2, "root element should has only first and last element");
    assert.equal(root.childNodes[0], first, "first in root should be equal the first element");
    assert.equal(root.childNodes[1], last, "last in root should be equal the last element");

    assert.equal(target.childNodes.length, 0, "target should has no childs");
  });
});
