import pino, { type LoggerOptions } from 'pino'
import pretty from 'pino-pretty'

const isProduction = process.env.NODE_ENV === 'production'

const options: LoggerOptions = {
  level: isProduction ? 'info' : 'debug',
  redact: ['*.password', '*.token', '*.email', '*.session'],
}

// pino's `transport` option spawns a worker thread to run pino-pretty, which
// doesn't survive Next.js's dev-server bundling (the worker script isn't
// resolvable from `.next/server/vendor-chunks`, crashing the request the
// first time anything logs). Using pino-pretty as an in-process destination
// stream instead of a worker-thread transport avoids that entirely — this is
// the standard workaround for pino-pretty under Next.js/bundled runtimes.
export const logger = isProduction ? pino(options) : pino(options, pretty({ colorize: true }))
