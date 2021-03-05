'use strict'

const util = require('util')
const logger = include('lib/logger')



class Statistics {
    constructor() {
        this.stats = {
            requests: {}
        }
    }


    requests() {
        const self = this

        return Object.getOwnPropertyNames(this.stats.requests).map(function(key) {
            return {
                key: key,
                counter: self.stats.requests[key].counter,
                last: self.stats.requests[key].last
            }
        })
    }


    // to be called from intercepted render funktion
    countRequests(req, res, view) {
        let user = req.connection.user ? req.connection.user.toLowerCase() : 'ANONYMOUS'
        user = res.locals.user ? res.locals.user.name : user
        const roles = res.locals.user ? res.locals.user.roles.join(',') : 'UNAUTHORIZED'
        view = view || ''

        const key = util.format(
            '%s (%s) [%s] %s {%s} #%s',
            user,
            roles,
            req.method,
            req.originalUrl.replace(/\/mskey\/\d+/, '/mskey/*').replace(/\?.*$/, ''),
            view === 'unauthorized' ? 'UNAUTHORIZED' : view,
            req.useragent.browser.toLowerCase()
        )

        if (!this.stats.requests.hasOwnProperty(key)) {
            this.stats.requests[key] = {
                counter: 1
            }
        }
        else {
            this.stats.requests[key].counter++
        }

        this.stats.requests[key].last = new Date()
    }
}



module.exports = new Statistics()
