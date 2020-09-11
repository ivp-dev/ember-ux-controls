import removeChilds from 'ember-ux-controls/utils/dom/remove-childs';
import { module, test } from 'qunit';

module('Unit | Utility | dom-utils/remove-childs', function () {

  // Replace this with your real tests.
  test('should remove childs', function (assert) {
    const
      parent = document.createElement('ul'),
      child_1 = document.createElement('li'),
      child_2 = document.createElement('li'),
      child_3 = document.createElement('li');

    parent.appendChild(child_1);
    parent.appendChild(child_2);
    parent.appendChild(child_3);

    assert.ok(parent.children.length === 3, "before remove should be 3");
    
    removeChilds(parent);

    assert.ok(parent.children.length === 0, "after remove should be 0");
  });
});
