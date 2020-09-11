import { IEquatable } from 'ember-ux-controls/common/types'

export default function equals(
  left: any,
  right: any
) {
  return (
    isEquatable(left)
      ? left.equals(right)
      : isEquatable(right)
        ? right.equals(left)
        : left === right
  );
}

function isEquatable(
  object: unknown
): object is IEquatable {
  return object && typeof (<IEquatable>object).equals === 'function';
}