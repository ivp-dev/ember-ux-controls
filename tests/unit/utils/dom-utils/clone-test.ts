import clone from 'ember-ux-controls/utils/dom/clone';
import { module, test } from 'qunit';

module('Unit | Utility | dom-utils/clone', function() {

  // Replace this with your real tests.
  test('should be cloned', function(assert) {
    const
      element = document.createTextNode("text"),
      cloned = clone(element);

    assert.equal(element.textContent, cloned.textContent, "text content should be equal with clone");
  });

  // Replace this with your real tests.
  test('should be cloned in deep', function(assert) {
    const
      element = document.createElement("div"),
      child = document.createTextNode("child");

    element.textContent = "parent";

    element.appendChild(child);

    const
      cloned = clone(element, true);

    assert.equal(element.textContent, cloned.textContent, "text content should be equal with clone");
    assert.equal(element.childNodes[0].textContent, element.childNodes[0].textContent, "text content should be equal with clone chield");
  });
});
