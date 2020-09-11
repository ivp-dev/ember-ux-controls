import EventEmmiter, { IEventEmmiter, IEventArgs } from 'ember-ux-controls/common/classes/-private/event-emmiter';
import { IDisposable } from "ember-ux-controls/common/types";
import using from 'ember-ux-controls/utils/using';
import EquatableArray from './equatable-array';

export class ArrayChangedEventArgs<T> implements IEventArgs {
  constructor(
    public offset: number,
    public newItems: Array<T>,
    public oldItems: Array<T>
  ) { }
}

export default class ObservableProxyArray<TContent> extends EquatableArray<TContent> {
  init() {
    super.init();
  }

  get eventHandler()
    : IEventEmmiter {
    
    if (this._eventHandler) {
      return this._eventHandler;
    }

    this._eventHandler = new EventEmmiter();

    return this._eventHandler;
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

    if (this._changer === null) {
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

        this.eventHandler.emitEvent(
          this,
          changer.prepareChangesEventArgs(startIdx)
        );
      });
    }

    return array;
  }

  private _changer: IChanger<TContent> | null = null;
  private _eventHandler: IEventEmmiter | null = null;

  private static Changer = class Changer<T> implements IChanger<T>, IDisposable {
    constructor(
      private owner: ObservableProxyArray<any> | null
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

    prepareChangesEventArgs(
      offset: number
    ) {
      let
        eventArgs: ArrayChangedEventArgs<T>;

      eventArgs = new ArrayChangedEventArgs(
        offset,
        this.sourceToAdd.slice(),
        this.sourceToRemove.slice()
      );

      return eventArgs;
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
          this.owner._changer = null;
          this.owner = null
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
  prepareChangesEventArgs: (offset: number) => ArrayChangedEventArgs<T>
  end: () => void
}