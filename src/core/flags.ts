import { Decimal, StackValue } from '../types';
import { log, FFlatError } from '../utils';
import { StackEnv } from '../engine/env';

/**
 * # Internal Flags
 */
export const flags = {
  /**
   * ## `set-system-property`
   *
   * sets a system level flag
   * - flags: `'log-level'`, `'decimal-precision'`
   *
   * `str a ⭢`
   *
   *
   * ```
   * f♭> 'log-level' 'trace' set-system-property
   * [ ]
   * ```
   */
  'set-system-property'(this: StackEnv, p: string, v: StackValue): void {
    switch (p) {
      case 'log-level':
        log.level = String(v);
        break;
      case 'decimal-precision':
        Decimal.config({ precision: +v });
        break;
      default:
        throw new FFlatError(
          `Error calling 'set-system-property': "${p}" is not a valid flag.`,
          this
        );
    }
  },

  /**
   * ## `get-system-property`
   *
   * gets a system level flag
   * - flags: `'log-level'`, `'decimal-precision'`
   *
   * `str ⭢ a`
   *
   * ```
   * f♭> 'log-level' get-system-property
   * [ 'warn' ]
   * ```
   */
  'get-system-property'(this: StackEnv, p: string) {
    switch (p) {
      case 'log-level':
        return (log.level = log.level);
      case 'decimal-precision':
        return Decimal.precision;
      default:
        throw new FFlatError(
          `Error calling 'get-system-property': "${p}" is not a valid flag.`,
          this
        );
    }
  }
};
