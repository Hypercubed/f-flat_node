import { Decimal } from '../types';
import { log, FFlatError } from '../utils';
import { StackEnv } from '../env';

/**
 * # Internal Flags
 */
export const flags = {
  /**
   * ## `set-system-property`
   *
   * sets a system level flag
   * - flags: `'auto-undo'`, `'log-level'`, `'decimal-precision'`
   *
   * ( x y -> )
   *

   *
   * ```
   * f♭> 'log-level' 'trace' set-system-property
   * [ ]
   * ```
   */
  'set-system-property'(this: StackEnv, p: string, v: any): void {
    switch (p) {
      case 'auto-undo':
        this.autoundo = Boolean(v);
        break;
      case 'log-level':
        log.level = String(v);
        break;
      case 'decimal-precision':
        Decimal.config({ precision: +v });
        break;
      default:
        throw new FFlatError(`Invalid flag: ${p}`, this);
    }
  },

  /**
   * ## `get-system-property`
   *
   * gets a system level flag
   * - flags: `'auto-undo'`, `'log-level'`, `'decimal-precision'`
   *
   * ( x -> y )
   *
   * ```
   * f♭> 'log-level' get-system-property
   * [ 'warn' ]
   * ```
   */
  'get-system-property'(this: StackEnv, p: string) {
    switch (p) {
      case 'auto-undo':
        return this.autoundo;
      case 'log-level':
        return log.level = log.level;
      case 'decimal-precision':
        return Decimal.precision;
      default:
        throw new FFlatError(`Invalid flag: ${p}`, this);
    }
  }
};
