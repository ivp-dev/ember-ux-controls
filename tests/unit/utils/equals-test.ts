import equals from 'ember-ux-controls/utils/equals';
import { module, test } from 'qunit';

class A {
  constructor(
    public index: number,
    public description: string
  ) {}
  equals(obj: any) {
    return obj && obj.index === this.index;
  }
}

class B {
  constructor(
    public index: number,
    public description: string
  ) {}
}


module('Unit | Utility | equals', function() {

  // Replace this with your real tests.
  test('eqauls util works as axpect', function(assert) {
    const
      a = new A(0, "instance of A"),
      b = new B(0, "instance of B");

    assert.ok(equals(a, b) && equals(b, a), "instances should be eqauls because both have the same index and one implements IDisposable");
    assert.ok(!equals(null, b) && !equals(a, null), "should be not eqaul with null");
  });
});
