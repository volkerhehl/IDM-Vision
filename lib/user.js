'use strict'

// user.js (Boilerplate)
// Version 1.0
// User objects, roles & privileges handling
// (c) 2020 Volker Hehl | MIT License


const logger = include('lib/logger')
const History = include('lib/History')
const DEFAULTS = include('lib/loadconf')('const/defaults')
const CONFIG_MAIN = include('lib/loadconf')('config/main')

let privBuffer = DEFAULTS.privileges
let roleBuffer = DEFAULTS.roles

let statistics = {
    users: {},
    privs: {}
}


// add custom roles
if (CONFIG_MAIN.roles) {
    for (let role in CONFIG_MAIN.roles) {
        roleBuffer[role] = CONFIG_MAIN.roles[role]
    }
}


class User {
    constructor({ name, longname, roles, info, mskey }) {
        if (!name) {
            throw new Error('Missing user name')
        }

        this.name = name
        this.longname = longname || ''
        this.roles = roles || []
        this.info = info
        this.privileges = User.compilePrivs(roles)
        this.history = new History()
        this.mskey = mskey
    }


    priv(privilege) {
        const granted = this.privileges.includes(privilege)

        if (!statistics.privs.hasOwnProperty(privilege)) {
            statistics.privs[privilege] = {}
        }

        if (!statistics.privs[privilege].hasOwnProperty(this.name)) {
            statistics.privs[privilege][this.name] = {
                granted: 0,
                rejected: 0
            }
        }

        statistics.privs[privilege][this.name][granted ? 'granted' : 'rejected']++
        return granted
    }


    // Privilege passing middleware
    static pass(privilege) {
        return function(req, res, next) {
            if (res.locals.user && res.locals.user.priv(privilege)) {
                next()
                return
            }

            res.render('unauthorized')
        }
    }


    static addPriv(name, description, group) {
        if (!privBuffer[group]) {
            throw new Error('Missing privilege group: ' + group)
        }

        if (!privBuffer[group].privs) {
            privBuffer[group].privs = {}
        }

        privBuffer[group].privs[name] = description
    }


    static addPluginPriv(plugin) {
        const [realm, type, name] = plugin.id.split('-')
        const priv = 'plugin-' + plugin.id
        let group = plugin.type + '-plugin-group'
        group = realm === 'int' ? 'int-' + group : 'custom-' + group
        User.addPriv(priv, plugin.topic, group)
        return priv
    }


    static allPrivs() {
        let privs = []

        for (let group in privBuffer) {
            if (privBuffer[group].privs) {
                for (let priv in privBuffer[group].privs) {
                    privs.push(priv)
                }
            }
        }

        return privs
    }


    static compilePrivs(roles) {
        let privs = []

        for (let role of roles) {
            let rolePrivs = roleBuffer[role].privs ? roleBuffer[role].privs : []

            if (rolePrivs === '*') {
                return User.allPrivs()
            }

            if (roleBuffer[role].groups) {
                for (let group of roleBuffer[role].groups) {
                    if (privBuffer[group].privs) {
                        const groupPrivs = Object.keys(privBuffer[group].privs)
                        rolePrivs = rolePrivs.concat(groupPrivs)
                    }
                }
            }

            for (let rpriv of rolePrivs) {
                if (!privs.includes(rpriv)) {
                    privs.push(rpriv)
                }
            }
        }

        return privs
    }


    static statistics() {
        return statistics
    }


    static getPrivileges() {
        return {
            privs: privBuffer,
            roles: roleBuffer
        }
    }
}



module.exports = User
