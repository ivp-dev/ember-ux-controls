import bem from 'ember-ux-controls/utils/bem';
import { module, test } from 'qunit';

module('Unit | Utility | bem', function () {
  test("bem('')", function (assert) { assert.equal(bem(''), ''); });

  test("bem('block')", function (assert) { assert.equal(bem('block'), 'block'); });

  test("bem('block', '$modifier')", function (assert) { assert.equal(bem('block', '$modifier'), 'block block_modifier'); });
  test("bem('block', '-modifier')", function (assert) { assert.equal(bem('block', '-modifier'), 'block block_modifier'); });
  test("bem('block', '_modifier')", function (assert) { assert.equal(bem('block', '_modifier'), 'block block_modifier'); });

  test("bem('block', { '$modifier': false })", function (assert) { assert.equal(bem('block', { '$modifier': false }), 'block'); });
  test("bem('block', { '-modifier': false })", function (assert) { assert.equal(bem('block', { '-modifier': false }), 'block'); });
  test("bem('block', { '_modifier': false })", function (assert) { assert.equal(bem('block', { '_modifier': false }), 'block'); });
  test("bem('block', { '$modifier': true })", function (assert) { assert.equal(bem('block', { '$modifier': true }), 'block block_modifier'); });
  test("bem('block', { '-modifier': true })", function (assert) { assert.equal(bem('block', { '-modifier': true }), 'block block_modifier'); });
  test("bem('block', { '_modifier': true })", function (assert) { assert.equal(bem('block', { '_modifier': true }), 'block block_modifier'); });

  test("bem('block')('element')", function (assert) { assert.equal(bem('block')('element'), 'block__element'); });

  test("bem('block')('element', '$modifier')", function (assert) { assert.equal(bem('block')('element', '$modifier'), 'block__element block__element_modifier'); });
  test("bem('block')('element', '-modifier')", function (assert) { assert.equal(bem('block')('element', '-modifier'), 'block__element block__element_modifier'); });
  test("bem('block')('element', '_modifier')", function (assert) { assert.equal(bem('block')('element', '_modifier'), 'block__element block__element_modifier'); });

  test("bem('block')('element', {'$modifier': true})", function (assert) { assert.equal(bem('block')('element', { '$modifier': true }), 'block__element block__element_modifier'); });
  test("bem('block')('element', {'-modifier': true})", function (assert) { assert.equal(bem('block')('element', { '-modifier': true }), 'block__element block__element_modifier'); });
  test("bem('block')('element', {'_modifier': true})", function (assert) { assert.equal(bem('block')('element', { '_modifier': true }), 'block__element block__element_modifier'); });

  test("bem('block')('element', {'$modifier': false})", function (assert) { assert.equal(bem('block')('element', { '$modifier': false }), 'block__element'); });
  test("bem('block')('element', {'-modifier': false})", function (assert) { assert.equal(bem('block')('element', { '-modifier': false }), 'block__element'); });
  test("bem('block')('element', {'_modifier': false})", function (assert) { assert.equal(bem('block')('element', { '_modifier': false }), 'block__element'); });

});
