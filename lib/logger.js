'use strict'

const CJSON = require('circular-json')
const winston = require('winston')
const Transport = require('winston-transport')
const util = require('util')
const args = include('lib/args')



class RingBuffer extends Transport {
    constructor(options) {
        const BUFFER_DEFAULT_SIZE = 500

        const bufferFormat = winston.format.combine(
            winston.format.splat(),
            winston.format.timestamp(),
            winston.format.printf(info => `${info.timestamp} [${info.level}]: ${info.message}`),
        )

        options = options || {}
        options.format = bufferFormat
        super(options)
        this.bufferSize = options.bufferSize || BUFFER_DEFAULT_SIZE
        this.buffer = []
    }


    log(info, cb) {
        const STOP_MESSAGE = 'STOP LOGGING REPEATING MESSAGE! ==> '
        const multiples = this.buffer.filter(b => b.message.replace(STOP_MESSAGE, '') == info.message)

        if (multiples.length < 4) {
            if (multiples.length == 3) {
                info.message = STOP_MESSAGE + info.message
            }

            this.buffer.push(info)
        }

        if (this.buffer.length > this.bufferSize) {
            this.buffer.splice(0, this.buffer.length - this.bufferSize)
        }

        cb()
    }


    get() {
        // logger.debugJSON(this.buffer)
        return [...this.buffer]
    }


    count(level, from) {
        const filtered = this.buffer.filter(
            b => b.level === level && (!from || new Date(from) < new Date(b.timestamp))
        )

        return filtered.length
    }
}




let level = 'debug'

if (args['-l']) {
    if (Object.getOwnPropertyNames(winston.config.npm.levels).includes(args['-l'])) {
        level = args['-l']
    }
}

const ringBufferTransport = new RingBuffer()

const consoleFormat = winston.format.combine(
    winston.format.splat(),
    winston.format.colorize(),
    winston.format.timestamp(),
    winston.format.align(),
    winston.format.printf(info => `${info.timestamp} [${info.level}]: ${info.message}`),
)

const consoleTransport = new winston.transports.Console({
    format: consoleFormat
})

let logger = winston.createLogger({
    level: level,
    transports: [
        consoleTransport,
        ringBufferTransport
    ]
})

logger.getBuffer = () => ringBufferTransport.get()
logger.count = (level, from) => ringBufferTransport.count(level, from)

if (!level) {
    logger.warn('invalid log level <%s>, using <info>!', args['-l'])
}

winston.addColors({
    http: 'cyan',
    verbose: 'grey'
})


logger.cjson = function(value) {
    return CJSON.stringify(value, null, 4)
}


logger.json = function(value) {
    return JSON.stringify(value, null, 4)
}


logger.debugCJSON = function(value) {
    this.debug(this.cjson(value))
}


logger.debugJSON = function(value) {
    this.debug(this.json(value))
}


const superError = logger.error

logger.error = function(err, add) {
    if (err instanceof Error) {
        superError((add ? add + ' ' : '') + err.stack)
        return
    }

    // @TODO: replace all error instances in arguments with error.message
    superError(util.format.apply(this, arguments))
}


// logger.error('Log level 0')
// logger.warn('Log level 1')
// logger.info('Log level 2')
// logger.http('Log level 3')
// logger.verbose('Log level 4')
// logger.debug('Log level 5')
// logger.silly('Log level 6')

module.exports = logger
