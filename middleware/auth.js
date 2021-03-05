'use strict'

const logger = include('lib/logger')
const Sqlizer = include('lib/sqlizer')
const idms = include('lib/idms')
const userstore = include('lib/userstore')
const CONFIG_MAIN = include('lib/loadconf')('config/main')

let nodeSSPIObj
let sspiIDM
let sspiInitialized = false
let sspiUpdating = false

if (CONFIG_MAIN.auth && CONFIG_MAIN.auth.method && CONFIG_MAIN.auth.method === 'sspi') {
    const NodeSSPI = require('node-sspi')
    sspiIDM = idms.get(CONFIG_MAIN.auth.source)
    nodeSSPIObj = new NodeSSPI({ retrieveGroups: false })
}


// Windows SSPI authentication
function authSSPI(req, res, next) {
    if (!sspiInitialized) {
        updateSSPIMapping()

        return res.render('error', {
            errorMessage: 'Error initializing SSPI authentication on ' + sspiIDM.name
        })
    }

    nodeSSPIObj.authenticate(req, res, function(err) {
        if (err) {
            logger.error(err)
        }

        res.finished || next()
    })
}


// @TODO: perodically update mapping buffer on requests - eg. every 10 minutes
async function updateSSPIMapping() {
    if (sspiInitialized || sspiUpdating) return
    sspiUpdating = true
    let idmName = '???'

    try {
        const userAttr = CONFIG_MAIN.auth.userAttr
        const userNameAttr = CONFIG_MAIN.auth.userNameAttr
        const domain = CONFIG_MAIN.auth.domain.toLowerCase()
        const manualRoles = CONFIG_MAIN.auth.manual
        const entryRoles = CONFIG_MAIN.auth.entries || {}
        let authPrivs = []

        for (let role in entryRoles) {
            if (Array.isArray(entryRoles[role])) {
                for (let entry of entryRoles[role]) {
                    authPrivs.push(entry)
                }
            }
            else {
                authPrivs.push(entryRoles[role])
            }
        }

        const privList = "'" + authPrivs.join("', '") + "'"

        const mappingBuffer = await sspiIDM.queryTemplate('auth-mapping', {
            priv_stringlist: privList,
            userAttr: userAttr,
            userNameAttr: userNameAttr
        })

        let matchedUsers = {}

        // collect idm mappings
        for (let mapping of mappingBuffer) {
            const fqUser = domain + '\\' + mapping.usr

            if (!matchedUsers.hasOwnProperty(fqUser)) {
                matchedUsers[fqUser] = {
                    name: mapping.name,
                    entryMatches: [],
                    roles: [],
                    mskey: mapping.mskey
                }
            }

            if (!matchedUsers[fqUser].entryMatches.includes(mapping.entry)) {
                matchedUsers[fqUser].entryMatches.push(mapping.entry)

                for (let role in entryRoles) {
                    if (Array.isArray(entryRoles[role])) {
                        for (let entry of entryRoles[role]) {
                            if (entry.toLowerCase() === mapping.entry.toLowerCase()) {
                                if (!matchedUsers[fqUser].roles.includes(role)) {
                                    matchedUsers[fqUser].roles.push(role)
                                }
                            }
                        }
                    }
                    else {
                        if (entryRoles[role].toLowerCase() === mapping.entry.toLowerCase()) {
                            if (!matchedUsers[fqUser].roles.includes(role)) {
                                matchedUsers[fqUser].roles.push(role)
                            }
                        }
                    }
                }
            }
        }

        // collect manual mappings
        for (let role in manualRoles) {
            for (let fqUser of manualRoles[role]) {
                if (!matchedUsers.hasOwnProperty(fqUser)) {
                    matchedUsers[fqUser] = {
                        roles: []
                    }
                }

                if (!matchedUsers[fqUser].roles.includes(role)) {
                    matchedUsers[fqUser].roles.push(role)
                }
            }
        }

        // add user to userstore
        for (let fqUser in matchedUsers) {
            const entryMatches = matchedUsers[fqUser].entryMatches

            const user = userstore.addUser({
                name: fqUser,
                longname: matchedUsers[fqUser].name,
                roles: matchedUsers[fqUser].roles,
                info: (entryMatches ? 'Matched entries: ' + entryMatches.join(', ') : null),
                mskey: matchedUsers[fqUser].mskey
            })
        }

        if (!sspiInitialized) {
            logger.info('SSPI authentication initialized on %s', sspiIDM.name)
        }

        sspiInitialized = true
    }
    catch (err) {
        if (err.name === 'ConnectionError') {
            logger.error('Error connecting %s for SSPI authentication', sspiIDM.name)
        }
        else {
            logger.error(err)
        }
    }

    sspiUpdating = false
}


function matchUser(req, res, next) {
    if (req.connection.user) {
        const fqUser = req.connection.user.toLowerCase()
        const user = userstore.find(fqUser)

        if (user && user.roles) {
            res.locals.user = user
            next()
            return
        }
    }

    res.render('unauthorized')
}


// Build full authorized anonymous super user
function authAnonymous(req, res, next) {
    res.locals.user = userstore.find('anonymous')
    next()
}


function auth(app) {
    try {
        if (CONFIG_MAIN.auth && CONFIG_MAIN.auth.method) {
            switch (CONFIG_MAIN.auth.method) {
                case 'sspi':
                    logger.info('Initialize SSPI authentication on %s', sspiIDM.name)
                    updateSSPIMapping()
                    app.use(authSSPI)
                    app.use(matchUser)
                    break

                case 'anonymous':
                    userstore.addUser({
                        name: 'anonymous',
                        longname: 'Anonymous',
                        roles: ['superuser'],
                        info: null
                    })

                    app.use(authAnonymous)
                    logger.warn('Anonymous full privileged access enabled!')
                    break

                default:
                    throw new Error('Unknown authentication method: ' + CONFIG_MAIN.auth.method)
            }
        }
        else {
            throw new Error('Authentication method not configured!')
        }
    }
    catch (err) {
        logger.error(err)
        logger.error(err.stack)
        process.exit(9)
    }
}


module.exports = auth