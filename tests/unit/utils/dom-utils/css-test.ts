import css from 'ember-ux-controls/utils/dom/css';
import { module, test } from 'qunit';

module('Unit | Utility | dom-utils/css', function () {

  // Replace this with your real tests.
  test('should set css', function (assert) {
    const
      element = document.createElement("div");

    css(element, {
      "border": "5px solid black",
      "background-color": "#fff"
    });


    // #fff equal rgb(255, 255, 255)
    assert.equal(element.style.border, "5px solid black", "border should be set");
    assert.equal(element.style.backgroundColor, "rgb(255, 255, 255)", "background-color should be set");

  });
});
