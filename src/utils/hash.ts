import { signature, Any } from '@hypercubed/dynamo';
import { v3 } from 'murmurhash';

import { dynamo } from '../types/dynamo';

class Hash {
  @signature()
  str(x: string): number {
    return v3(x);
  }
  @signature(Array)
  arr(x: any[]): number {
    const type = Object.prototype.toString.call(x);
    let hash = v3(type);
    for (let i = 0; i < x.length; i++) {;
      hash += hashCode(x[i]);
    }
    return hash;
  }
  @signature(Object)
  obj(x: Object): number {
    const type = Object.prototype.toString.call(x);
    const keys = Object.keys(x).sort();
    let hash = v3(type);
    for (let i = keys.length - 1; i >= 0; i--) {
      const key = keys[i];
      hash += v3(key) + hashCode(x[key]);
    }
    return hash;
  }
  @signature(Any)
  any(x: any): number {
    const type = Object.prototype.toString.call(x);
    return v3(type) + v3(JSON.stringify(x));
  }
}

export const hashCode = dynamo.function(Hash);