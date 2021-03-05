'use strict'

const EventEmitter = require('events')
const CJSON = require('circular-json')

const logger = include('lib/logger')
const args = include('lib/args')

const DEBUG = args['--debug-eventhub']



class EventHub extends EventEmitter {
    constructor() {
        super()
    }


    emit(type, data, ...args) {
        if (DEBUG === true || DEBUG === type) {
            logger.debug('%s: %s', type, CJSON.stringify(data, null, 4))
        }

        super.emit(type, data, ...args)
    }


    mount(io) {
        this.on('probes', (data) => {
            io.emit('probes', data)
        })

        io.on('connection', (socket) => {
            socket.on('trigger', (trigger) => {
                this.emit('trigger', trigger)
            })
        })
    }
}



module.exports = new EventHub()
