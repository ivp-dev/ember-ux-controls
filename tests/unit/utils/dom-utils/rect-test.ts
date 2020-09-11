import rect from 'ember-ux-controls/utils/dom/rect';
import { module, test } from 'qunit';

module('Unit | Utility | dom-utils/rect', function() {

  // Replace this with your real tests.
  test('should get bounding client rectange of the element', function(assert) {
    let result = rect(document.createElement('div'));
    assert.ok(result instanceof DOMRect);
  });
});
