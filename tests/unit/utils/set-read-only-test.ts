import setReadOnly from 'ember-ux-controls/utils/set-read-only';
import { module, test } from 'qunit';

module('Unit | Utility | set-read-only', function() {
  class Test {
    value?: boolean
  }

  // Replace this with your real tests.
  test('set readonly property with value', function(assert) {
    const 
      test: Readonly<Test> = { }
    
    setReadOnly(test, "value", true);

    assert.ok(test.value, "should be true");
  });

  test('set readonly property with callback', function(assert) {
    const 
      test: Readonly<Test> = { }
    
    setReadOnly(test, "value", (_) => true);

    assert.ok(test.value, "should be true");
  });
});
