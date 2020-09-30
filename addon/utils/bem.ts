//original source-code https://github.com/romeobravo/bem-classes
//TODO: mayby it's better to make bem part a of the ember-ux-controls?
import { assert } from '@ember/debug';

export type ClassNamesBuilder = {
  (element: string, ...elementArgs: (string | object)[]): ClassNamesDriver;
  toString(formatter?: (driver: ClassNamesDriver) => string): string;
}

/**
 * BEM class names builder 
 * @param block 
 * @param args 
 */
function bem(
  block: string,
  ...args: Array<string | object>
): ClassNamesBuilder {

  assert("Block should have single class name.", block.indexOf(' ') === -1);

  const classNamesBuilder: ClassNamesBuilder = (
    element: string,
    ...elementArgs: Array<string | object>
  ) => {
    return new ClassNamesDriver(block, element, elementArgs);
  };

  classNamesBuilder.toString = (
    formatter?: (driver: ClassNamesDriver) => string
  ) => (
      formatter
        ? formatter(new ClassNamesDriver(block, false, args))
        : new ClassNamesDriver(block, false, args).toString()
    );

  return classNamesBuilder;
}

export default bem;

function optionFactory(
  base: string,
  option: unknown
): BaseOption {
  if (option !== null && typeof option === 'object') {
    return new ObjectOption(base, option as object);
  }

  if (option instanceof String || typeof option === 'string') {
    return new StringOption(base, option as string);
  }

  return new BaseOption();
}

export class ClassNamesDriver {
  constructor(
    private block: string,
    private element: string | boolean,
    private options: Array<string | object>
  ) { }

  /**
   * Base class name (block | block__element)
   */
  public get base() {
    return this.element
      ? `${this.block}__${this.element}`
      : this.block;
  }

  /**
   * Base class name with modifiers (this.base + $modifiers)
   */
  public get names() {
    return this.options.map(option =>
      optionFactory(this.base, option).toString()
    ).filter((value, index, array) =>
      array.indexOf(value) === index &&
      value.length
    );
  }

  /**
   * All class names (base + base__modifiers)
   */
  public get classes() {
    return this.names.length
      ? [this.base].concat(this.names)
      : [this.base];
  }

  public toString(formatter?: (driver: ClassNamesDriver) => string) {
    return formatter 
      ? formatter(this)
      : this.classes.join(' ').trim();
  }
}

class BaseOption {
  public toString() {
    return '';
  }
}

class ObjectOption extends BaseOption {
  constructor(
    public base: string,
    public option: object
  ) { super() }

  public get classNames() {
    return Object.keys(this.option).reduce((names: Array<string>, key: string) => (
      Reflect.get(this.option, key)
        ? names.concat(this.keyToString(key))
        : names
    ), [])
  }

  public toString() {
    return this.classNames.join(' ').trim();
  }

  private keyToString(key: string) {
    return new StringOption(this.base, key).toString()
  }
}

class StringOption extends BaseOption {
  constructor(
    public base: string,
    public option: string
  ) { super() }

  get isModifier() {
    return (
      this.hasPrefix('$') ||
      this.hasPrefix('-') ||
      this.hasPrefix('_')
    );
  }

  public toString() {
    return this.isModifier
      ? this.toModifier()
      : this.option;
  }

  private withoutPrefix() {
    return this.option.substring(1)
  }

  private hasPrefix(char: string) {
    return this.option.charAt(0) === char;
  }

  //TODO: set seporator in app config
  private toModifier() {
    return `${this.base}_${this.withoutPrefix()}`;
  }
}
