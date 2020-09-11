import { isArray } from '@ember/array';
import { get } from '@ember/object';

export default function truth(
  result?: boolean | number | string | Array<any> | null
) {
  if (typeof result === 'boolean') { 
    return result; 
  }

  if (isArray(result)) {
    return get(result, 'length') !== 0;
  } else {
    return !!result;
  }
}
