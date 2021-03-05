'use strict'

const Influx = require('influx')

const logger = include('lib/logger')
const args = include('lib/args')
const CONFIG_MAIN = include('lib/loadconf')('config/main')

const DEBUG = args['--debug-influxdb']
const WRITE_BUFFER_INTERVAL = 1000
const METADATA_MEASSUREMENT_NAME = 'meta'



class InfluxDB {
    constructor() {
        const self = this
        this.writeBuffer = []

        if (!CONFIG_MAIN.influxdb || !CONFIG_MAIN.influxdb.host || !CONFIG_MAIN.influxdb.dbname) {
            logger.error('[InfluxDB] incomplete configuration')
            process.exit(2)
        }

        // ignoring downtimes
        if (CONFIG_MAIN.influxdb.maxDowntimeMinutes && CONFIG_MAIN.influxdb.resetDowntimeMinutes) {
            this.ignoreDowntimes = true
            this.maxDowntimeSeconds = CONFIG_MAIN.influxdb.maxDowntimeMinutes * 60
            this.resetDowntimeSeconds = CONFIG_MAIN.influxdb.resetDowntimeMinutes * 60
            this.firstDowntime = null
            this.lastDowntime = null
        }

        this.influx = new Influx.InfluxDB({
            host: CONFIG_MAIN.influxdb.host,
            port: CONFIG_MAIN.influxdb.port,
            database: CONFIG_MAIN.influxdb.dbname
        })

        this.influx.getDatabaseNames()

        .then(function(names) {
            if (!names.includes(CONFIG_MAIN.influxdb.dbname)) {
                logger.warn('[InfluxDB] new database created: ' + CONFIG_MAIN.influxdb.dbname)
                return self.influx.createDatabase(CONFIG_MAIN.influxdb.dbname)
            }

            return
        })

        .then(function() {
            logger.info(
                '[InfluxDB] connected to host: "%s",%s database: "%s"',
                CONFIG_MAIN.influxdb.host,
                CONFIG_MAIN.influxdb.port ? ' port: ' + CONFIG_MAIN.influxdb.port + ', ' : '',
                CONFIG_MAIN.influxdb.dbname
            )

            if (self.ignoreDowntimes) {
                logger.info(
                    '[InfluxDB] ignoring max downtime of %s minutes within %s minutes',
                    self.maxDowntimeSeconds / 60,
                    self.resetDowntimeSeconds / 60
                )
            }

            // write buffer to InfluxDB every WRITE_BUFFER_INTERVAL ms
            setInterval(function() {
                const now = Math.floor(Date.now() / 1000)

                // reset downtime counter?
                if (self.ignoreDowntimes && self.lastDowntime) {
                    if (now - self.lastDowntime > self.resetDowntimeSeconds) {
                        logger.info(
                            '[InfluxDB] reported downtime from %s to %s',
                            new Date(self.firstDowntime * 1000),
                            new Date(self.lastDowntime * 1000)
                        )

                        self.firstDowntime = null
                        self.lastDowntime = null
                    }
                }

                if (self.writeBuffer.length > 0) {
                    if (DEBUG) {
                        logger.debug('[InfluxDB] writing %s points', self.writeBuffer.length)
                    }

                    self.writeBuffer.push({
                        measurement: METADATA_MEASSUREMENT_NAME,
                        tags: {},
                        fields: {
                            pointsWritten: self.writeBuffer.length
                        }
                    })

                    self.influx.writePoints(
                        self.writeBuffer,
                        {
                            precision: 'ms'
                        }
                    )
                    .catch(function(err) {
                        function logError() {
                            logger.error('[InfluxDB] error writing points!\n%s', err.stack)
                        }

                        if (self.ignoreDowntimes) {
                            self.lastDowntime = now

                            // ignore downtime?
                            if (self.firstDowntime) {
                                const downtimeDiff = self.lastDowntime - self.firstDowntime

                                if (downtimeDiff > self.maxDowntimeSeconds) {
                                    logError()
                                }
                            }
                            else {
                                self.firstDowntime = self.lastDowntime
                            }
                        }
                        else {
                            logError()
                        }
                    })

                    self.writeBuffer = []
                }
            }, WRITE_BUFFER_INTERVAL)
        })

        .catch(function(err) {
            logger.error('[InfluxDB] ', err)
            // process.exit(2)
        })
    }


    write(point) {
        this.writeBuffer.push(point)
    }
}



// return initialized singleton
module.exports = new InfluxDB()