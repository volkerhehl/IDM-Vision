'use strict'

const util = require('util')
const Promise = require('bluebird')

const Sqlizer = include('lib/sqlizer')
const logger = include('lib/logger')
const limit = include('lib/limit')
const CONFIG_IDMS = include('lib/loadconf')('config/idms')
const args = include('lib/args')

const DEBUG = args['--debug-queries']
const JOBLOG_MAX_SIZE = 1000
const JOBLOG_UPDATE_INTERVAL_S = 5
const DEFAULT_BUFFER_TIME_S = 60

const REALM_SORT_ORDER = {
    prod: 'A:',
    test: 'B:',
    dev: 'C:'
}


function uiOrder(a, b) {
    const aSig = REALM_SORT_ORDER[a.realm]
    const bSig = REALM_SORT_ORDER[b.realm]
    if (aSig < bSig) { return -1 }
    if (aSig > bSig) { return 1 }
    return 0
}



class Idm {
    constructor(id, config, db) {
        this.id = id
        this.config = config
        this.db = db
        this.name = config.name
        this.description = config.description

        // initialize buffers ..
        this.attributes = []
        this.idstores = []
        this.jobLog = []
        this.globalVars = []
        this.jobVars = []
        this.repoVars = []
        this.globalScripts = []
        this.jobs = []

        // asyncronous detecting major version number
        this.init = this.getMVN()
    }


    async query(sql) {
        if (DEBUG) {
            logger.debug('%s: %s', this.name, sql)
        }

        const recordsets = await this.db.query(sql)
        if (recordsets.length == 0) { return }
        if (recordsets.length > 1) { return recordsets }
        return recordsets[0]
    }


    async queryTemplate(sqlTemplateName, params) {
        const sql = new Sqlizer(sqlTemplateName).render(params)
        return await this.query(sql)
    }


    asListEntry() {
        return {
            id: this.id,
            name: this.name,
            realm: this.config.realm,
            description: this.config.description
        }
    }



    // attributes changes rarely, buffer for 10 minutes
    async getAttributes({ bufferTime = DEFAULT_BUFFER_TIME_S } = {}) {
        await limit.run('Idm#getAttributes:' + this.id, bufferTime, async () => {
            const result = await this.queryTemplate('attributes')

            if (result) {
                this.attributes = result.map(e => e.AttrName)
            }
        })

        if (this.attributes.length === 0) {
            throw new Error('Failed fetching attributes from ' + this.name)
        }

        return this.attributes
    }


    // see getAttributes
    async getIdStores({ bufferTime = DEFAULT_BUFFER_TIME_S } = {}) {
        await limit.run('Idm#getIdStores:' + this.id, bufferTime, async () => {
            const result = await this.queryTemplate('idstores')

            if (result) {
                this.idstores = result
            }
        })

        if (this.idstores.length === 0) {
            throw new Error('Error fetching ID stores from ' + this.name)
        }

        return this.idstores
    }


    async updateSystemConfig({ bufferTime = DEFAULT_BUFFER_TIME_S } = {}) {
        // ensuring completion of the last run for concurrent calls
        // @TODO: save?
        if (this.updateSystemConfigLastQuery) {
            await this.updateSystemConfigLastQuery
        }

        if (limit.expired('Idm#updateSystemConfig:' + this.id, bufferTime, true)) {
            this.updateSystemConfigLastQuery = this.queryTemplate('systemconfig')
            const result = await this.updateSystemConfigLastQuery
            this.globalVars = result[0]
            this.jobVars = result[1]
            this.repoVars = result[2]
            this.globalScripts = result[3]
            this.jobs = result[4]

            for (let script of this.globalScripts) {
                if (!script.ScriptDefinition) {
                    continue
                }

                const base64Code = script.ScriptDefinition
                .replace('{B64}', '')
                .replace('\r\n', '\n')

                script.ScriptDefinition = Buffer.from(base64Code, 'base64').toString('utf8')
            }

            for (let job of this.jobs) {
                if (!job.JobDefinition) {
                    continue
                }

                const base64Code = job.JobDefinition
                .replace('{B64}', '')
                .replace('\r\n', '\n')

                job.JobDefinition = Buffer.from(base64Code, 'base64').toString('utf8')
            }
        }
    }


    // update buffered joblog max. one time every <bufferTime> seconds
    // truncate buffer length by <JOBLOG_MAX_SIZE> entries and return joblog
    async updateJobLog({ bufferTime = JOBLOG_UPDATE_INTERVAL_S, throwErrors = true } = {}) {
        try {
            if (limit.expired('Idm#updateJobLog:' + this.id, bufferTime, true)) {
                const lastId = this.jobLog.length > 0 ? this.jobLog[0].LOG_ID : 0

                const newLogs = await this.queryTemplate('joblog', {
                    fromId: lastId,
                    top: JOBLOG_MAX_SIZE
                })

                this.jobLog = newLogs.concat(this.jobLog).slice(0, JOBLOG_MAX_SIZE)
            }
        }
        catch (err) {
            if (throwErrors) {
                throw err
            }

            logger.error('%s: %s: %s', this.id, err.message, err.stack)
        }
    }


    async getJobLog({ jobId, fromId, max = JOBLOG_MAX_SIZE }) {
        if (max > JOBLOG_MAX_SIZE) {
            max = JOBLOG_MAX_SIZE
        }

        if (jobId) {
            return await this.queryTemplate('joblogbyid', {
                jobId: jobId,
                fromId: fromId || 0,
                top: max
            })
        }

        await this.updateJobLog()
        let toIdx = this.jobLog.length

        if (fromId) {
            this.jobLog.find(function(job, idx) {
                if (job.LOG_ID == fromId) {
                    toIdx = idx
                    return true
                }
            })
        }

        if (toIdx > max) {
            toIdx = max
        }

        return this.jobLog.slice(0, toIdx)
    }


    async getMVN() {
        this.mvn = null

        try {
            const detectedMVN = await this.queryTemplate('get-mvn')
            this.mvn = detectedMVN.length > 0 ? Number(detectedMVN[0].MVN) : false
        }
        catch (err) {
            // logger.error(err)
            // this.mvn = null
        }

        if (!this.mvn || this.mvn === '?') {
            logger.error(
                'Error detecting %s major version number (%s)',
                this.name,
                this.mvn === null ? 'connection error' : null
            )
        }
        else {
            logger.info('%s major version number = %s', this.name, this.mvn)
        }
    }


    async getGlobalVar(varname, fullResult = false) {
        const result = await this.queryTemplate('get-global-var', { varname })

        if (fullResult) {
            return result
        }

        return result[0] ? result[0].VARVALUE : null
    }
}



class Idms {
    constructor() {
        this.idms = {}
        this.inits = []

        for (let idmId in CONFIG_IDMS) {
            let idmconf = CONFIG_IDMS[idmId]
            idmconf.name = idmconf.name || idmId.toUpperCase()
            logger.info('Initialize IDM: %s - %s', idmconf.name, idmconf.description)
            let idmdb

            try {
                switch (idmconf.dbtype) {
                    case 'mssql':
                        const DbMsSQL = include('lib/db-mssql')
                        idmdb = new DbMsSQL(idmconf.dbconfig)
                        break
                    // @TODO: add support for oracle here ?!
                }

                if (idmdb) {
                    const idm = new Idm(idmId, idmconf, idmdb)
                    this.idms[idmId] = idm
                    this.inits.push(idm.init)
                }
                else {
                    logger.error(
                        'Unknown DB type <%s> in config <%s>!',
                        idmconf.dbtype,
                        idmconf.name
                    )

                    process.exit(1)
                }
            }
            catch (err) {
                logger.error(err)
                throw err
            }
        }

        this.init = Promise.all(this.inits)
    }


    ids() {
        return Object.getOwnPropertyNames(this.idms)
    }


    get(id) {
        return id ? this.idms[id] : null
    }


    firstId() {
        return this.ids()[0]
    }


    first() {
        return this.get(this.firstId())
    }


    getOrFirst(id) {
        const idm = this.get(id)
        return idm ? idm : this.first()
    }


    list() {
        const self = this

        let list = this.ids().map(function(id) {
            return self.idms[id].asListEntry()
        })

        list = list.sort(uiOrder)
        return list
    }


    all() {
        return this.ids().map(i => this.idms[i])
    }
}



module.exports = new Idms()
