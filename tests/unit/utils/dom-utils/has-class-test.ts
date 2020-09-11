import hasClass from 'ember-ux-controls/utils/dom/has-class';
import { module, test } from 'qunit';

module('Unit | Utility | dom-utils/has-class', function () {
  const
    element = document.createElement("div"),
    className = "testClass";

  element.classList.add(className);

  // Replace this with your real tests.
  test('should check if element has class', function (assert) {
    assert.ok(hasClass(element, className), "element has class");
  });

  test('should check if array of elements has class', function (assert) {
    assert.ok(hasClass([element], className), "elements has class");
  });
});
