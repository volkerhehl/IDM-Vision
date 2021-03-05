'use strict'

const util = require('util')

const Sqlizer = include('lib/sqlizer')
const Entry = include('lib/entry')
const plugins = include('lib/plugins')
const logger = include('lib/logger')
const Menu = include('lib/menu')
const idms = include('lib/idms')


async function entryController(req, res, next) {
    const user = res.locals.user
    const idm = res.locals.defs.idm
    const mskey = res.locals.vars.mskey
    const entry = new Entry(idm, mskey)
    const compareIdm = req.query.compareidm ? idms.get(req.query.compareidm) : idm

    const compareEntry =
        req.query.comparemskey ? new Entry(compareIdm, req.query.comparemskey) : null

    await entry.load()

    if (entry.attributes.length == 0) {
        res.render('error', { errorMessage: 'Entry not found!' })
        return
    }

    if (compareEntry) {
        await compareEntry.load()

        if (compareEntry.attributes.length == 0) {
            res.render('error', { errorMessage: 'Compare entry not found!' })
            return
        }
    }

    const history = user.history.register(entry)
    res.locals.vars.entrytype = entry.entrytype
    res.locals.vars.mskeyvalue = entry.mskeyvalue
    res.locals.vars.displayname = entry.displayname
    let activeEntryPlugins = plugins.findAllByEntryType(entry.entrytype)

    if (user) {
        activeEntryPlugins = activeEntryPlugins.filter(function(plugin) {
            return user.priv(plugin.privilege)
        })
    }

    if (activeEntryPlugins.length < 1) {
        const errorMessage = 'No entry plugins available or NOT AUTHORIZED'
        res.render('error', { errorMessage })
        return
    }

    let currentPlugin

    if (req.params.entryPlugin) {
        currentPlugin = activeEntryPlugins.find(p => p.id === req.params.entryPlugin)

        if (!currentPlugin) {
            res.render('error', {
                errorMessage: 'Invalid plugin or NOT AUTHORIZED: ' + req.params.entryPlugin
            })

            return
        }
    }

    currentPlugin = currentPlugin ? currentPlugin : activeEntryPlugins[0]


    // entry tab menu structure ..
    res.locals.defs.menus.entryPlugins = new Menu('idm-entry-plugin-menu')

    for (let plugin of activeEntryPlugins) {
        res.locals.defs.menus.entryPlugins.addItem({
            name: plugin.topic,
            link: util.format('/idm/%s/mskey/%s/%s', res.locals.vars.idmId, mskey, plugin.id),
            display: plugin.privilege,
            activate: plugin.privilege,
            selected: currentPlugin.id === plugin.id
        })
    }


    // evaluate and render plugin
    if (currentPlugin) {
        try {
            const params = req.query

            const valuesFromPluginCall = await currentPlugin.call({
                idm,
                entry,
                params,
                compareEntry
            })

            res.locals.vars.renderedPlugin = currentPlugin.render(
                res.locals.vars.idmId,
                valuesFromPluginCall,
                params,
                history,
                mskey
            )
        }
        catch (err) {
            res.locals.vars.errorAdd = util.format('Plugin [%s]', currentPlugin.id)
            logger.error(err, res.locals.vars.errorAdd)
            res.locals.vars.error = err
        }
    }

    // page title
    res.locals.vars.titleAdd += util.format(
        ' - %s: %s - %s',
        currentPlugin.topic,
        entry.mskeyvalue,
        entry.displayname
    )

    res.render('entry')
}


module.exports = entryController
