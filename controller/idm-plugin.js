'use strict'

// generic plugin controller

const util = require('util')
const plugins = include('lib/plugins')
const stats = include('middleware/stats')
const logger = include('lib/logger')


async function pluginController(req, res, next, polling) {
    const plugin = plugins.find(req.params.genericPlugin)

    try {
        if (!plugin) {
            throw new Error('No such generic plugin')
        }

        if (!res.locals.user || !res.locals.user.priv(plugin.privilege)) {
            res.render('unauthorized')
            return
        }

        if (plugin.validIdms && !plugin.validIdms.includes(res.locals.defs.idm.id)) {
            res.render('unsupported', { moduleName: plugin.topic })
            return
        }

        res.locals.vars.titleAdd += ' - ' + plugin.topic

        let pluginReturn = await plugin.call({
            idm: res.locals.defs.idm,
            params: req.query,
            polling: polling
        })

        pluginReturn = pluginReturn || {}

        if (polling) {
            stats.countRequests(req, res, 'plugin')
            res.json(pluginReturn)
            return
        }

        if (pluginReturn.titleAdd) {
            res.locals.vars.titleAdd += pluginReturn.titleAdd
        }

        res.locals.vars.renderedPlugin = plugin.render(
            res.locals.vars.idmId,
            pluginReturn,
            req.query
        )
    }
    catch (err) {
        res.locals.vars.errorAdd = util.format('Plugin [%s]', plugin.id)
        logger.error(err, res.locals.vars.errorAdd)
        res.locals.vars.error = err
    }

    res.render('plugin')
}


function base(req, res, next) {
    pluginController(req, res, next, false)
}


function poll(req, res, next) {
    pluginController(req, res, next, true)
}


module.exports = { base, poll }

