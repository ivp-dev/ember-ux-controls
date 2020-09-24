import preventNativeEvent from 'dummy/utils/prevent-native-event';
import { module, test } from 'qunit';

module('Unit | Utility | prevent-native-event', function(hooks) {

  // Replace this with your real tests.
  test('it works', function(assert) {
    let result = preventNativeEvent();
    assert.ok(result);
  });
});
