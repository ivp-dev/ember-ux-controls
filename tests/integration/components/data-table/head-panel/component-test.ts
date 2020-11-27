import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | data-table/head-panel', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    await render(hbs`{{data-table/head-panel}}`);

    assert.equal(this.element?.textContent?.trim(), '');

    // Template block usage:
    await render(hbs`
      {{#data-table/head-panel}}
        template block text
      {{/data-table/head-panel}}
    `);

    assert.equal(this.element?.textContent?.trim(), 'template block text');
  });
});
