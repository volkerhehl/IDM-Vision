'use strict'

const { ConnectionPool } = require('mssql')
const logger = include('lib/logger')

const TIMEOUT = 120000
let databases = []



class DbMsSQL {
    constructor(config) {
        if (!config.hasOwnProperty('options')) {
            config.options = {}
        }

        config.connectionTimeout = config.connectionTimeout ? config.connectionTimeout : TIMEOUT
        config.requestTimeout = config.requestTimeout ? config.requestTimeout : TIMEOUT
        config.options.enableArithAbort = true
        this.pool = new ConnectionPool(config)
        this.connection = this.pool.connect()
        this.config = config
        databases.push(this)
    }


    async query(sql) {
        // ensure established connection
        await this.connection
        const request = this.pool.request()
        let result = await request.query(sql)
        return result.recordsets
    }


    static async closeAll() {
        for (let db of databases) {
            await db.pool.close()
        }
    }
}



module.exports = DbMsSQL
