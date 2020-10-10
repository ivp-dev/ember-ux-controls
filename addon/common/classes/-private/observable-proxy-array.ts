
import { EventArgs, IEventArgs, IEventEmmiter } from 'ember-ux-controls/common/types';
import { BaseEventArgs } from '../event-args';
import EventEmmiter from '../event-emmiter';
import EquatableArray from './equatable-array';

export class ObservableProxyArrayChangedEventArgs extends BaseEventArgs {
  constructor(
    public offset: number,
    public newItems: Array<unknown>,
    public oldItems: Array<unknown>
  ) { super() }
}

export default class ObservableProxyArray<TContent> extends EquatableArray<TContent> {

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

    this.notifyListeners(
      ...this.changer.prepareChanges(startIdx)
    );

    this.changer.end();

    return array;
  }

  public addEventListener(
    context: object,
    key: EventArgs<IEventArgs>,
    callback: (sender: object, args: IEventArgs
    ) => void) {
    this.eventEmmiter.addEventListener(context, key, callback)
  }

  public removeEventListener(
    context: object,
    key: EventArgs<IEventArgs>,
    callback: (sender: object, args: IEventArgs
    ) => void) {
    this.eventEmmiter.removeEventListener(context, key, callback)
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

    //TODO: if forget to unsubscribe. Maybe no need?
    if(this._eventEmmiter && this._eventEmmiter.hasListeners) {
      this._eventEmmiter.clearEventListeners();
    }
  }

  protected notifyListeners(
    sourceToAdd: TContent[],
    sourceToRemove: TContent[],
    offset: number
  ) {
    this.eventEmmiter.emitEvent(
      this,
      ObservableProxyArrayChangedEventArgs,
      offset,
      sourceToAdd,
      sourceToRemove
    );
  }

  protected get eventEmmiter() {
    if (!this._eventEmmiter) {
      this._eventEmmiter = new EventEmmiter();
    }
    return this._eventEmmiter;
  }

  private _eventEmmiter?: IEventEmmiter;
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