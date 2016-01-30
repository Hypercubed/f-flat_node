import {transports, Logger} from 'winston';
import Progress from 'progress';

export const log = new Logger({
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    timing: 3,
    trace: 4,
    debug: 5
  },
  transports: [
    new transports.Console()
  ]
});

// log.cli();
log.level = process.env.NODE_ENV || 'warn';

export const bar = new (Progress)(':elapsed s [:bar] :stack :queue :depth', {
  complete: '=',
  incomplete: ' ',
  total: 100,
  width: 50,
  clear: true,
  renderThrottle: 320,
  stream: process.stderr
});
