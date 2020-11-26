'use strict';

const funnel = require('broccoli-funnel');


module.exports = {
  name: require('./package').name,

  included: function (/* app */) {
    this._super.included.apply(this, arguments);
  },

  treeForStyles: function () {
    var app = this.app;
    var parent = this.parent;
    var hostApp = typeof this._findHost === 'function' ? this._findHost() : undefined;
    // *Either* use the options for an addon which is consuming this, *or* for
    // an app which is consuming this, but never *both* at the same time. The
    // special case here is when testing an addon.
    // In lazy loading engines, the host might be different from the parent, so we fall back to that one
    var options = (app && app.options && app.options.uxComponents)
      || (parent && parent.options && parent.options.uxComponents)
      || (hostApp && hostApp.options && hostApp.options.uxComponents)
      || {};

    // by default use bootstrap convention of css class naming
    if (options.notation === 'oocss') {
      return funnel('addon/styles', {
        exclude: ['**/*.bem.scss'],
        getDestinationPath: destination('oocss')
      });
    } else {
      return funnel('addon/styles', {
        exclude: ['**/*.oocss.scss'],
        getDestinationPath: destination('bem')
      });
    }
  }

}

function destination(convention) {
  
  return function (relativePath) {
    if (relativePath === `addon.${convention}.scss`) {
      console.log(relativePath)
      return 'addon.scss';
    }

    return relativePath;
  }
}
