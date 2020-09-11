import { helper } from '@ember/component/helper';
import truth from 'ember-ux-controls/utils/truth';

export function and(params: any /*, hash*/) {
  for (const value of params) {
    if(truth(value) === false) {
      return value;
    }
  }
  return params[params.length - 1];
}

export default helper(and);
