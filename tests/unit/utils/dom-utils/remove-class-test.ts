import removeClass from 'ember-ux-controls/utils/dom/remove-class';
import { module, test } from 'qunit';

module('Unit | Utility | dom-utils/remove-class', function () {
  // Replace this with your real tests.
  test('should remove class to the element', function (assert) {
    const
      classNames = 'test1 test2',
      remveClass = 'test1',
      element = document.createElement("div");


    classNames.split(' ').forEach((className) =>
      element.classList.add(className)
    );

    removeClass(element, remveClass);

    assert.notOk(
      element.classList.contains(remveClass),
      "Check does element contains the class"
    );

  });

  test('should remove class to the array of elements', function (assert) {
    const
      classNames = 'test1 test2',
      remveClass = 'test1',
      element = document.createElement("div");


    classNames.split(' ').forEach((className) =>
      element.classList.add(className)
    );

    removeClass([element], remveClass);

    assert.notOk(
      element.classList.contains(remveClass),
      "Check does element contains the class"
    );

  });
});
