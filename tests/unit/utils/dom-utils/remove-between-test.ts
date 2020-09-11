import removeBetween from 'ember-ux-controls/utils/dom/remove-between';
import { module, test } from 'qunit';

module('Unit | Utility | dom-utils/remove-between', function () {

  // Replace this with your real tests.
  test('should remove nodes between', function (assert) {
    const
      parent = document.createElement('ul'),
      child_1 = document.createElement('li'),
      child_2 = document.createElement('li'),
      child_3 = document.createElement('li');

    parent.setAttribute("id", "1");
    child_1.setAttribute('id', '1.1')
    child_2.setAttribute('id', '1.2')
    child_3.setAttribute('id', '1.3')

    parent.insertBefore(child_1, null);
    parent.insertBefore(child_2, null);


    removeBetween(parent, child_1, child_2);

    assert.equal(parent.childNodes.length, 2, "length should be equal 2 because there are no children between");
    assert.equal(parent.children[0].getAttribute('id'), '1.1');
    assert.equal(parent.children[1].getAttribute('id'), '1.2');

    parent.insertBefore(child_3, null);

    removeBetween(parent, child_1, child_3);

    assert.equal(parent.childNodes.length, 2, "length should be equal 2 because middle node should be removed");
    assert.equal(parent.children[0].getAttribute('id'), '1.1');
    assert.equal(parent.children[1].getAttribute('id'), '1.3');
  });
});
