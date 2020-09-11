import { IDisposable } from 'ember-ux-controls/common/types';

export default abstract class Disposable implements IDisposable {
  private _disposed: boolean = false;

  public get isDisposed() {
    return this._disposed;
  }

  public dispose() {
    this._disposed = true;
  }
}