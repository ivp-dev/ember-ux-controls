import addClass from 'ember-ux-controls/utils/dom/add-class';
import { module, test } from 'qunit';

module('Unit | Utility | dom-utils/add-class', function () {
  // Replace this with your real tests.
  test('should add class to the element', function (assert) {
    const
      className = 'test',
      element = document.createElement("div");

    addClass(element, className);
    
    assert.ok(
      element.classList.contains(className),
      "Check does element contains the class"
    );

  });

  test('should add class to the array of elements', function (assert) {
    const
      className = 'test',
      element = document.createElement("div");

    addClass([ element ], className);
    
    assert.ok(
      element.classList.contains(className),
      "Check does element contains the class"
    );

  });
});
