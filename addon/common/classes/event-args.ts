import { IEventArgs } from "ember-ux-controls/common/types";

export class BaseEventArgs implements IEventArgs {
  private _stopped: boolean = false;
  private _canceled: boolean = false;

  public get canceled() {
    return this._canceled;
  }

  public get stopped() {
    return this._stopped;
  }

  public cancel() {
    this._canceled = true;
  }

  public stopPropagation() {
    this._stopped = true;
  }
}