
import EquatableArray from './equatable-array';

export default class ObservableProxyArray<TContent> extends EquatableArray<TContent> {
  public init() {
    super.init();
  }

  private get changer(): IChanger<TContent> {
    if (!this._changer) {
      this._changer = this._changer = new ObservableProxyArray.Changer<TContent>();
    }

    return this._changer;
  }

  public arrayContentWillChange(
    startIdx: number,
    removeAmt: number,
    addAmt: number
  ) {
    let
      array: this;

    array = super.arrayContentWillChange(
      startIdx,
      removeAmt,
      addAmt
    );


    if (this.changer.isActive === false) {
      this.changer.begin();
      if (removeAmt > 0) {
        this.changer.sourceToRemove = this.changer.sourceToRemove.concat(
          array.slice(startIdx, startIdx + removeAmt)
        );
      }
    }

    return array;
  }

  public arrayContentDidChange(
    startIdx: number,
    removeAmt: number,
    addAmt: number
  ) {
    let
      array: this

    array = super.arrayContentDidChange(
      startIdx,
      removeAmt,
      addAmt
    );

    if (!this.changer.isActive) {
      throw 'Change process was not start';
    }

    if (addAmt > 0) {
      this.changer.sourceToAdd = this.changer.sourceToAdd.concat(
        array.slice(startIdx, startIdx + addAmt)
      );
    }

    this.changerDone(...this.changer.prepareChanges(startIdx));

    this.changer.end();

    return array;
  }

  public willDestroy() {
    super.willDestroy();

    if (
      this._changer
    ) {
      if (this._changer.isActive) {
        this._changer.end();
      }

      this._changer = void 0;
    }

  }

  protected changerDone(
    _sourceToAdd: TContent[],
    _sourceToRemove: TContent[],
    _offset: number
  ) { }

  private _changer?: IChanger<TContent>;

  private static Changer = class Changer<T> implements IChanger<T> {
    constructor() {
      this.isActive = false;
      this.sourceToAdd = [];
      this.sourceToRemove = [];
    }

    isActive: boolean
    sourceToRemove: Array<T>
    sourceToAdd: Array<T>

    begin() {
      this.isActive = true;
    }

    prepareChanges(
      offset: number
    ): [Array<T>, Array<T>, number] {
      return [
        this.sourceToAdd.slice(),
        this.sourceToRemove.slice(),
        offset
      ];
    }

    end() {
      this.cleanup();
    }

    cleanup() {
      this.isActive = false;
      this.sourceToRemove.length = 0;
      this.sourceToAdd.length = 0
    }
  }
}

interface IChanger<T> {
  isActive: boolean,
  sourceToRemove: Array<unknown>,
  sourceToAdd: Array<unknown>,
  cleanup: () => void,
  begin: () => void,
  prepareChanges: (offset: number) => [Array<T>, Array<T>, number]
  end: () => void
}