import { signature, Any } from '@hypercubed/dynamo';
import * as MurmurHash3 from 'imurmurhash';

import { dynamo } from '../types/dynamo';

const m = new MurmurHash3();

class Hash {
  @signature()
  str(x: string): void {
    m.hash(x);
  }
  @signature(Array)
  arr(x: any[]): void {
    const type = Object.prototype.toString.call(x);
    m.hash(type);
    for (let i = 0; i < x.length; i++) {
      hashAdd(x[i]);
    }
  }
  @signature(Object)
  obj(x: Object): void {
    const type = Object.prototype.toString.call(x);
    const keys = Object.keys(x).sort();
    m.hash(type);
    for (let i = keys.length - 1; i >= 0; i--) {
      const key = keys[i];
      hashAdd(key);
      hashAdd(x[key]);
    }
  }
  @signature(Any)
  any(x: any): void {
    const type = Object.prototype.toString.call(x);
    m.hash(type);
    m.hash(JSON.stringify(x));
  }
}

const hashAdd = dynamo.function(Hash);

export function hashCode(x: any): number {
  m.reset();
  hashAdd(x);
  return m.result();
}