import trigger from 'ember-ux-controls/utils/dom/trigger';
import { module, test } from 'qunit';

module('Unit | Utility | dom-utils/trigger', function() {

  // Replace this with your real tests.
  test('should trigger event', function(assert) {
    var detail = 'test event';
    var eventType = 'TestEvent';
    var eventSource = document.createElement('div');
    
    eventSource.addEventListener(eventType, (e: CustomEvent) => {
      assert.ok(e.type === eventType, 'event type is ok');
      assert.ok(e.detail === detail, 'target is ok')
    });

    trigger(eventSource, eventType, false, false, detail);
  });
});
