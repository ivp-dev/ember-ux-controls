import off from 'ember-ux-controls/utils/dom/off';
import { module, test } from 'qunit';

module('Unit | Utility | dom-utils/off', function() {

  // Replace this with your real tests.
  test('should off event subscribe', function(assert) {
    var eventType   = 'TestEvent';
    var eventSource = document.createElement('div');
    var callback    = () => ++index; 
    var event       = new CustomEvent(eventType);
    var index       = 0;

    eventSource.addEventListener(eventType, callback);
    // first call. index should be 1
    eventSource.dispatchEvent(event);
    // switch off event handler
    off(eventSource, eventType, callback);
    // second call. index should not be changed
    eventSource.dispatchEvent(event);

    assert.ok(index === 1);
  });
});
