import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Helper | truth/and', function(hooks) {
  setupRenderingTest(hooks);

  // Replace this with your real tests.
  test('boolean values', async function(assert) {
    await render(hbs`[{{truth/and true true}}] [{{truth/and true false}}] [{{truth/and false true}}] [{{truth/and false false}}]`);
    
    assert.equal(this.element.textContent, '[true] [false] [false] [false]', 'value should be "[true] [false] [false] [false]"');
  });

  test('integer values', async function(assert) {
    await render(hbs`[{{truth/and 1 1}}] [{{truth/and 1 0}}] [{{truth/and 0 1}}] [{{truth/and 0 0}}]`);

    assert.equal(this.element.textContent, '[1] [0] [0] [0]', 'value should be "[1] [0] [0] [0]"');
  });

  test('string values', async function(assert) {
    await render(hbs`[{{truth/and " " " "}}] [{{truth/and " " ""}}] [{{truth/and "" " "}}] [{{truth/and "" ""}}]`);

    assert.equal(this.element.textContent, '[ ] [] [] []', 'value should be "[ ] [] [] []"');
  });


  test('undefined list length and boolean', async function(assert) {
    await render(hbs`[{{truth/and array.length 1}}]`);

    assert.equal(this.element.textContent, '[]', 'value should be "[]"');
  });

  test('null list length and boolean', async function(assert) {
    this.set('array', null);

    await render(hbs`[{{truth/and array.length 1}}]`);

    assert.equal(this.element.textContent, '[]', 'value should be "[]"');
  });

  test('empty list length and boolean', async function(assert) {
    this.set('array', []);

    await render(hbs`[{{truth/and array.length 1}}]`);

    assert.equal(this.element.textContent, '[0]', 'value should be "[0]"');
  });

  test('non-empty list length and boolean', async function(assert) {
    this.set('array', ['a']);

    await render(hbs`[{{truth/and array.length 2}}]`);

    assert.equal(this.element.textContent, '[2]', 'value should be "[2]"');
  });
});
