import using from 'ember-ux-controls/utils/using';
import { module, test } from 'qunit';

module('Unit | Utility | using', function () {

  class Disposable {
    dispose() {
      this._disposed = true;
    }

    foo() {
      this._jobDone = true;
    }
    get jobDone() {
      return this._jobDone;
    }

    get isDisposed() {
      return this._disposed;
    }

    private _jobDone: boolean = false
    private _disposed: boolean = false;
  }
  // Replace this with your real tests.
  test('it works', function (assert) {
    let
      disposable = new Disposable();

    using(
      disposable,
      (d: Disposable) => { d.foo() }
    );

    assert.ok(
      disposable.jobDone && disposable.isDisposed, 
      "job should be done and disposed"
    );
  });
});
