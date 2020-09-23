
import { IDisposable } from "ember-ux-controls/common/types";
import using from 'ember-ux-controls/utils/using';
import EquatableArray from './equatable-array';

export default class ObservableProxyArray<TContent> extends EquatableArray<TContent> {
  init() {
    super.init();
  }

  arrayContentWillChange(
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

    if (typeof this._changer === 'undefined') {
      this._changer = new ObservableProxyArray.Changer<TContent>(this);
    }

    if (this._changer.isActive === false) {
      this._changer.begin();
      if (removeAmt > 0) {
        this._changer.sourceToRemove = this._changer.sourceToRemove.concat(
          array.slice(startIdx, startIdx + removeAmt)
        );
      }
    }

    return array;
  }

  arrayContentDidChange(
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

    if (this._changer && this._changer.isActive) {
      using(this._changer, (changer) => {
        if (addAmt > 0) {
          changer.sourceToAdd = changer.sourceToAdd.concat(
            array.slice(startIdx, startIdx + addAmt)
          );
        }

        this.changerDone(...changer.prepareChanges(startIdx));
      });
    }

    return array;
  }

  protected changerDone(
    _sourceToAdd: TContent[],
    _sourceToRemove: TContent[],
    _offset: number
  ) { }

  private _changer?: IChanger<TContent>;

  private static Changer = class Changer<T> implements IChanger<T>, IDisposable {
    constructor(
      private owner?: ObservableProxyArray<any>
    ) {
      this.isActive = false;
      this.sourceToAdd = [];
      this.sourceToRemove = [];
    }

    isActive: boolean;
    sourceToRemove: Array<T>;
    sourceToAdd: Array<T>;

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

    dispose() {
      if (this._disposed === false) {
        this.end();

        if (this.owner) {
          this.owner._changer = void 0;
          this.owner = void 0
        }

        this._disposed = true;
      }
    }

    private _disposed: boolean = false
  }
}

interface IChanger<T> {
  isActive: boolean,
  sourceToRemove: Array<unknown>,
  sourceToAdd: Array<unknown>,
  cleanup: () => void,
  dispose: () => void,
  begin: () => void,
  prepareChanges: (offset: number) => [Array<T>, Array<T>, number]
  end: () => void
}