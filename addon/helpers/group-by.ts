import { helper } from '@ember/component/helper';
import MutableArray from '@ember/array/mutable';
import { get } from '@ember/object';

export function groupBy(params: [keyof any, MutableArray<any>]) {
  let
    byPath: keyof any,
    array: MutableArray<any>,
    groups: any;

  [byPath, array] = [...params];
  groups = {};

  array.forEach((item) => {
    let groupName = get(item, byPath);
    let group = groups[groupName];

    if (!Array.isArray(group)) {
      group = [];
      groups[groupName] = group;
    }

    group.push(item);
  });
  

  return groups;
}

export default helper(groupBy);
