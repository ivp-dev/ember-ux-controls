import { IDisposable } from 'ember-ux-controls/common/types'

type UsingObject = IDisposable;

export default function using<TD extends UsingObject, TR = void>(
  resource: TD,
  func: (resource: TD) => TR
): TR {
  let
    shouldDispose = true,
    result: TR;

  try {
    result = func(resource);

    } finally {
    if(shouldDispose) {
      destroy(resource);
    }
  }

  return result;
}

function destroy(obj: UsingObject) {
  if(!obj) return;
  
  if(!(typeof (<UsingObject>obj).dispose === 'function')) {
    throw new Error("Object provided to using did not have a dispose method")
  }

  return obj.dispose();
}