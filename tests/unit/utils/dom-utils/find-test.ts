import find from 'ember-ux-controls/utils/dom/find';
import { module, test } from 'qunit';

module('Unit | Utility | dom-utils/find', function () {
  // Replace this with your real tests.
  test('should find elements by selector', function (assert) {
    const
      root = document.createElement("div"),
      first = document.createElement("div"),
      last = document.createElement("div"),
      between = document.createElement("div"),
      selectorClass = "testClass",
      selectorId = "testId"

    between.classList.add(selectorClass)
    last.id = selectorId;
    // append childs
    root.appendChild(first);
    root.appendChild(between);
    root.appendChild(last);

    assert.equal(find(root, `.${selectorClass}`)[0], between, "should find by class");
    assert.equal(find(root, `#${selectorId}`)[0], last, "should find by id");
    assert.equal(find(root, 'div').length, 3, "should find all childs by tag name");
  });
});
