'use strict'

const util = require('util')
const Promise = require('bluebird')

const logger = include('lib/logger')
const plugins = include('lib/plugins')
const idms = include('lib/idms')
const influxdb = include('lib/influxdb')
const eventhub = include('lib/eventhub')
const CONFIG_MAIN = include('lib/loadconf')('config/main')

const INTERVAL_S = CONFIG_MAIN.probes.interval ? CONFIG_MAIN.probes.interval : 60
const DEVIATION_RANGE_MS = 500
const SERIAL_DELAY_MS = 500



class Probe {
    constructor(plugin, probes) {
        const self = this
        this.name = plugin.id
        this.plugin = plugin
        this.probes = probes
        this.running = false
        this.skipped = false
        this.error = false
        this.cycles = 0
        this.skips = 0
        this.errors = 0
        this.idmStats = {}
        this.endpoints = {}
        this.enabledIDMs = idms.all()
        const enabledMVNs = plugin.controller.enabledMVNs
        const disabledIDMs = plugin.controller.disabledIDMs

        if (enabledMVNs) {
            this.enabledIDMs = this.enabledIDMs.filter(idm => enabledMVNs.includes(idm.mvn))
        }

        if (disabledIDMs) {
            this.enabledIDMs = this.enabledIDMs.filter(idm => !disabledIDMs.includes(idm.id))
        }

        for (let idm of this.enabledIDMs) {
            this.idmStats[idm.id] = {
                running: false,
                cycles: 0,
                errors: 0
            }
        }

        this.intervalMS = INTERVAL_S * 1000
        this.intervalMS += Math.random() * DEVIATION_RANGE_MS
        this.intervalMS = Math.round(this.intervalMS)

        logger.info(
            'Initializing probe %s with interval of %s ms, enalbed for: %s',
            this.name,
            this.intervalMS,
            this.enabledIDMs.map(i => i.name).join(', ')
        )

        this.interval = setInterval(async function() {
            self.skipped = false

            if (self.running) {
                logger.warn('Skipping probe call %s while still running', self.name)
                self.skips++
                self.skipped = true
                self.probes.emitStatus()
                return
            }

            self.running = true
            self.probes.emitStatus()
            self.error = false

            // call serial with delay
            for (let i in self.enabledIDMs) {
                if (i > 0) await Promise.delay(SERIAL_DELAY_MS)
                await self.call(self.enabledIDMs[i])
            }

            self.running = false
            self.cycles++
            if (self.error) self.errors++
            self.probes.emitStatus()
        }, this.intervalMS)
    }


    registerEndpoints(point) {
        if (!this.endpoints[point.measurement]) {
            this.endpoints[point.measurement] = {
                fields: Object.getOwnPropertyNames(point.fields),
                tags: Object.getOwnPropertyNames(point.tags)
            }
        }
        else {
            for (let field of Object.getOwnPropertyNames(point.fields)) {
                if (!this.endpoints[point.measurement].fields.includes(field)) {
                    this.endpoints[point.measurement].fields.push(field)
                }
            }

            for (let tag of Object.getOwnPropertyNames(point.tags)) {
                if (!this.endpoints[point.measurement].tags.includes(tag)) {
                    this.endpoints[point.measurement].tags.push(tag)
                }
            }
        }
    }


    async call(idm) {
        let error = false

        try {
            this.idmStats[idm.id].running = true
            this.probes.emitStatus()

            // ensure using initialized idm here!
            await idm.init
            const result = await this.plugin.call({ idm })

            if (!result.points || !Array.isArray(result.points)) {
                throw new Error(util.format('Probe %s (%s) should return an points array', this.name, idm.name))
            }

            if (result.points.length == 0) {
                throw new Error(util.format('Probe %s (%s) returns an empty points array', this.name, idm.name))
            }

            for (const point of result.points) {
                if (!point.measurement) {
                    throw new Error(util.format('Probe %s (%s) missing measurement name', this.name, idm.name))
                }

                if (typeof point.measurement !== 'string') {
                    throw new Error(util.format('Probe %s (%s) wrong measurement name', this.name, idm.name))
                }

                if (!point.fields || Object.getOwnPropertyNames(point.fields).length == 0) {
                    throw new Error(util.format('Probe %s (%s) missing fields in point', this.name, idm.name))
                }

                for (let field of Object.getOwnPropertyNames(point.fields)) {
                    if (typeof point.fields[field] !== 'number') {
                        throw new Error(util.format(
                            'Probe %s (%s), field %s is not a number',
                            this.name,
                            idm.name,
                            field
                        ))
                    }
                }

                if (!point.tags) {
                    point.tags = {}
                }

                point.tags.idm = idm.name

                for (const field of Object.getOwnPropertyNames(point.fields)) {
                    influxdb.write(point)
                }

                this.registerEndpoints(point)
            }
        }
        catch (err) {
            logger.error('Probe %s (%s) failed: %s', this.name, idm.name, err.message)
            this.idmStats[idm.id].errors++
            this.error = true
            error = true
        }

        if (!error) {
            this.idmStats[idm.id].cycles++
        }

        this.idmStats[idm.id].running = false
        this.probes.emitStatus()
    }
}



class Probes {
    constructor() {
        this.all = plugins.findAllByType('probe').map(p => new Probe(p, this))

        eventhub.on('trigger', (trigger) => {
            if (trigger === 'probes-update') {
                this.emitStatus()
            }
        })
    }


    flat() {
        return this.all.map(p => {
            return {
                name: p.name,
                intervalMS: p.intervalMS,
                running: p.running,
                skipped: p.skipped,
                error: p.error,
                cycles: p.cycles,
                skips: p.skips,
                errors: p.errors,
                idmStats: p.idmStats
            }
        })
    }


    endpoints() {
        let eps = []

        for (let probe of this.all) {
            for (let ep of Object.getOwnPropertyNames(probe.endpoints)) {
                eps.push({
                    probe: probe.name,
                    measurement: ep,
                    fields: probe.endpoints[ep].fields,
                    tags: probe.endpoints[ep].tags
                })
            }
        }

        return eps
    }


    emitStatus() {
        eventhub.emit('probes', this.flat())
    }
}


async function initialize() {
    await idms.init
    return new Probes()
}


// return async initialized singleton
module.exports = initialize()
