import { IEventArgs } from "ember-ux-controls/common/types";

export class BaseEventArgs implements IEventArgs {
  constructor() {
    this._canceled = false;
    this._stopped = false;
  }

  public get stopped() {
    return this._stopped;
  }

  public get canceled() {
    return this._canceled;
  }

  public stop() {
    this._stopped = true;
  }

  public cancel() {
    this._canceled = true;
  }

  public stopPropagation() {
    this._stopped = true;
  }

  private _stopped: boolean;
  private _canceled: boolean;
}