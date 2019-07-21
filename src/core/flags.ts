import { Decimal } from '../types';
import { log } from '../utils';
import { StackEnv } from '../env';

/**
 * # Internal Flags
 */
export const flags = {
  /**
   * ## `set-precision`
   *
   * Sets the internal decimal precision
   *
   */
  'set-precision'(x: any) {
    Decimal.config({ precision: +x });
  },

  /**
   * ## `get-precision`
   *
   * Gets the internal decimal precision
   *
   */
  'get-precision'() {
    return Decimal.precision;
  },

  /**
   * ## `set-log-level`
   * sets the current logging level
   *
   * ( {string} -> )
   */
  'set-log-level'(a: string): void {
    log.level = a;
  },

  /**
   * ## `get-log-level`
   * gets the current logging level
   *
   * ( -> {string} )
   */
  'get-log-level'() {
    return log.level;
  },

  /**
   * ## `auto-undo`
   * set flag to auto-undo on error
   *
   * ( {boolean} -> )
   */
  'set-auto-undo'(this: StackEnv, a: boolean): void {
    this.autoundo = a;
  }
};
