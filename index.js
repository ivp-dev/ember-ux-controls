'use strict';

const 
  SassPlugin = require('./plugins/sass-plugin'),
  Merge = require('broccoli-merge-trees');


module.exports = {
  name: require('./package').name,

  treeForAddon(tree) {
    const
      app = this._findHost(),
      options = typeof app.options === 'object' ? app.options : {},
      uxConfig = options['ember-ux-controls'] || {},
      styles = new SassPlugin(tree, {
        annotation: "Pods: compile styles",
        styleName: this.name,
        includeAddonStyle: !!uxConfig.includeAddonStyle
      });

    return this._super.treeForAddon.call(
      this,
      new Merge(
        [styles, tree], {
        overwrite: true
      }));
  }
}
