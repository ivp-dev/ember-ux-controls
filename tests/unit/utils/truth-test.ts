import truth from 'ember-ux-controls/utils/truth';
import { module, test } from 'qunit';

module('Unit | Utility | truth', function () {
  test('bool: true', function (assert) { assert.equal(truth(true), true); });
  test('bool: false', function (assert) { assert.equal(truth(false), false); });

  test('int: -1', function (assert) { assert.equal(truth(-1), true); });
  test('int: 0', function (assert) { assert.equal(truth(0), false); });
  test('int: 1', function (assert) { assert.equal(truth(1), true); });

  test('string: ""', function (assert) { assert.equal(truth(""), false); });
  test('string: " "', function (assert) { assert.equal(truth(" "), true); });
  test('string: "."', function (assert) { assert.equal(truth("."), true); });

  test('null/undefined: null', function (assert) { assert.equal(truth(null), false); });
  test('null/undefined: undefined', function (assert) { assert.equal(truth(undefined), false); });

  test('array: []', function (assert) { assert.equal(truth([]), false); });
  test('array: [""]', function (assert) { assert.equal(truth([""]), true); });
  test('array: [0]', function (assert) { assert.equal(truth([0]), true); });
  test('array: [false]', function (assert) { assert.equal(truth([false]), true); });
  test('array: [true]', function (assert) { assert.equal(truth([true]), true); });
});
