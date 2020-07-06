const Plugin = require('broccoli-plugin');
const Sass = require('sass');
const path = require('path');
const walkSync = require('walk-sync');


module.exports = class SassPlugin extends Plugin {
  constructor(
    inputTree,
    options
  ) {
    super(
      [inputTree],
      {
        name: (options && options.name),
        annotation: (options && options.annotation)
      }
    );

    this.styleName = options.styleName;
    this.includeAddonStyle = options.includeAddonStyle || true;
  }

  fileName(ext) {
    return `${this.styleName}.${ext}`
  }

  build() {
    if (this.includeAddonStyle === false) {
      return;
    }

    const
      fileName = this.fileName('.scss'),
      imports = walkSync.entries(
        this.inputPaths[0]
      ).filter(
        entry =>
          !entry.isDirectory() && entry.relativePath.slice(-5) === '.scss'
      ).map(
        entry =>
          `@import \"${entry.relativePath}\"`
      );

    this.output.writeFileSync(
      fileName,
      imports.join(';')
    );

    this.output.writeFileSync(
      this.fileName('.css'),
      Sass.renderSync({
        file: path.join(this.outputPath, fileName),
        includePaths: this.inputPaths
      }).css
    );
  }
}