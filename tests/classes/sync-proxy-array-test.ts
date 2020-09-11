import SyncProxyArray from 'ember-ux-controls/common/classes/-private/sync-proxy-array';
import { module, test } from 'qunit';
import { A } from '@ember/array';

class SyncProxyArrayTestClass extends SyncProxyArray<number, number> {
  serializeToContent(source: number) { return source };
  serializeToSource(content: number) { return content };
}

module('Classes | -Private | SyncProxyArray', function () {

  test('sync-array w/o source', function (assert) {
    const
      syncProxyArray = SyncProxyArrayTestClass.create();

    syncProxyArray.pushObject(0);

    assert.equal(syncProxyArray.count, 1, 'count should be 1');

    syncProxyArray.removeAt(0);

    assert.equal(syncProxyArray.count, 0, 'count should be 0');

  });

  test('source sync with sync-array', function (assert) {
    const
      source = A([0, 1, 2]),
      syncProxyArray = SyncProxyArrayTestClass.create({
        source
      });

    assert.equal(syncProxyArray.count, 3, 'proxy count should be 3');
    assert.equal(source.length, 3, 'source length should be 3');

    source.pushObject(3)

    assert.equal(syncProxyArray.count, 4, 'proxy count should be 4');

    source.removeAt(0);

    assert.equal(syncProxyArray.count, 3, 'proxy count should be 3');

    assert.ok(source.every((value, index) =>
      syncProxyArray.objectAt(index) === value), 'arrays are equal'
    );

  });

  test('sync-array sync with source', function (assert) {
    const
      source = A([0, 1, 2]),
      syncProxyArray = SyncProxyArrayTestClass.create({
        source
      });

    assert.equal(syncProxyArray.count, 3, 'proxy count should be 3');
    assert.equal(source.length, 3, 'source length should be 3');

    syncProxyArray.pushObject(3)

    assert.equal(source.length, 4, 'source length should be 3');

    syncProxyArray.removeAt(0);

    assert.equal(source.length, 3, 'source length should be 3');

    assert.ok(source.every((value, index) =>
      syncProxyArray.objectAt(index) === value), 'arrays are equal'
    );

  });
});
