import { CompareCallback } from 'ember-ux-controls/common/types';
import equals from 'ember-ux-controls/utils/equals';
import ArrayProxy from '@ember/array/proxy';
import { A } from '@ember/array';
import Enumerable from "@ember/array/-private/enumerable";
import { isArray } from '@ember/array';
import { reads } from '@ember/object/computed';

export default class EquatableArray<TContent> extends ArrayProxy<TContent> {
  init() {
    if (!this.content) {
      this.set('content', A([]))
    }

    super.init();
  }

  @reads('length')
  public count: number = 0

  public pushObjects(objects: Enumerable<TContent>) {
    if (Array.isArray(objects)) {
      return super.pushObjects(objects)
    } else if (isArray(objects)) {
      return super.pushObjects(A(objects.toArray()));
    }
    throw 'objects should be an array'
  }

  public pushObject(object: TContent) {
    return super.pushObject(object)
  }

  public indexOf(
    searchElement: TContent,
    startAt?: number
  ): number {
    return indexOfEquatable(this, this.compare, searchElement, startAt);
  }

  public lastIndexOf(
    object: TContent,
    startAt: number
  ): number {
    return this.lastIndexOfOverride(object, startAt)
  }

  public removeObject(
    object: TContent
  ): TContent {
    return this.removeObjectOverride(object);
  }

  public includes(
    searchElement: TContent,
    fromIndex?: number
  ): boolean {
    return indexOfEquatable(this, this.compare, searchElement, fromIndex, true) !== -1;
  }

  protected lastIndexOfOverride(
    object: TContent, startAt: number
  ): number {
    let
      len: number,
      idx: number;

    len = this.count;

    if (startAt === undefined || startAt >= len) {
      startAt = len - 1;
    }

    if (startAt < 0) {
      startAt += len;
    }

    for (idx = startAt; idx >= 0; idx--) {
      if (this.compare(objectAt(this, idx), object)) {
        return idx;
      }
    }

    return -1;
  }

  protected removeObjectOverride(
    object: TContent
  ): TContent {
    let
      loc: number;

    loc = this.count || 0;

    while (--loc >= 0) {
      var curObject = this.objectAt(loc);

      if (this.compare(curObject, object)) {
        this.removeAt(loc);
      }
    }

    return object;
  }

  protected compare(
    left: any,
    right: any
  ): boolean {
    return equals(left, right);
  }
}

function indexOfEquatable<T>(
  array: EquatableArray<T>,
  compare: CompareCallback,
  value: T,
  startAt = 0,
  withNaNCheck: boolean = false
): number {
  let
    len: number

  len = array.count;

  if (startAt < 0) {
    startAt = startAt + len;
  }

  var predicate = (withNaNCheck && value !== value)
    ? (item: unknown) => item !== item
    : (item: unknown) => compare.call(array, item, value);

  return findIndex(array, predicate, startAt);
}

function findIndex<T>(
  array: EquatableArray<T>,
  predicate: (
    item: unknown,
    index: number,
    array: EquatableArray<T>
  ) => boolean,
  startAt: number
): number {
  let
    len: number,
    index: number,
    item: unknown;

  len = array.count;

  for (index = startAt; index < len; index++) {
    item = objectAt(array, index);

    if (predicate(item, index, array)) {
      return index;
    }
  }

  return -1;

}

function objectAt<T>(
  array: EquatableArray<T>,
  index: number
) {
  return array.objectAt(index);
}