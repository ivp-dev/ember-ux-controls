import on from 'ember-ux-controls/utils/dom/on';
import { module, test } from 'qunit';

module('Unit | Utility | dom-utils/on', function () {

  // Replace this with your real tests.
  test('should subscribe on event', function (assert) {
    let detail = 'test event';
    let eventType = 'TestEvent';
    let eventSource = document.createElement('div');

    on(eventSource, eventType, (e: CustomEvent) => {
      assert.ok(e.type === eventType, 'event type is ok');
      assert.ok(e.detail === detail, 'target is ok')
    });
    let event = new CustomEvent(eventType, { detail });
    eventSource.dispatchEvent(event);
  });

  test('should subscribe on event as array', function (assert) {
    let detail = 'test event';
    let eventType = 'TestEvent';
    let eventSource = document.createElement('div');

    on([eventSource], eventType, (e: CustomEvent) => {
      assert.ok(e.type === eventType, 'event type is ok');
      assert.ok(e.detail === detail, 'target is ok')
    });
    let event = new CustomEvent(eventType, { detail });
    eventSource.dispatchEvent(event);
  });
});
