'use strict'

const logger = include('lib/logger')
const User = include('lib/user')
const userstore = include('lib/userstore')
const statistics = include('middleware/stats')
const idms = include('lib/idms')
const CONFIG_MAIN = include('lib/loadconf')('config/main')
const probesPromise = CONFIG_MAIN.probes && include('lib/probes')


async function pageviews(req, res, next) {
    const pageviews = statistics.requests().sort(function(a, b) {
        if (a.last > b.last) { return -1 }
        if (a.last < b.last) { return 1 }
        return 0
    })

    res.render('admin-pageviews', { pageviews })
}


async function users(req, res, next) {
    let idmID = null

    if (CONFIG_MAIN.auth && CONFIG_MAIN.auth.source) {
        idmID = idms.get(CONFIG_MAIN.auth.source).id
    }

    const users = userstore.users
    res.render('admin-users', { idmID, users })
}


async function privs(req, res, next) {
    const privileges = User.getPrivileges()
    let privs = []
    let roles = []

    for (const group in privileges.privs) {
        for (const priv in privileges.privs[group].privs) {
            privs.push({
                groupName: privileges.privs[group].description,
                groupId: group,
                privName: privileges.privs[group].privs[priv],
                privId: priv
            })
        }
    }

    for (const role in privileges.roles) {
        for (const priv in privileges.roles[role].privs) {
            roles.push({
                roleName: privileges.roles[role].description,
                roleId: role,
                groupId: null,
                privId: privileges.roles[role].privs[priv],
            })
        }

        for (const group in privileges.roles[role].groups) {
            roles.push({
                roleName: privileges.roles[role].description,
                roleId: role,
                groupId: privileges.roles[role].groups[group],
                privId: null,
            })
        }
    }

    res.render('admin-privs', { privs, roles })
}


async function probes(req, res, next) {
    res.render('admin-probes', {
        idms: idms.list(),
        database: CONFIG_MAIN.influxdb,
        endpoints: probesPromise && (await probesPromise).endpoints()
    })
}


async function logs(req, res, next) {
    let logBuffer = logger.getBuffer().sort((a, b) => a.timestamp < b.timestamp ? 1 : -1)
    res.render('admin-logs', {
        logs: logBuffer
    })
}



exports.pageviews = pageviews
exports.users = users
exports.privs = privs
exports.probes = probes
exports.logs = logs
