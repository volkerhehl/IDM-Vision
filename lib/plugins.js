'use strict'

const util = require('util')
const path = require('path')
const fs = require('fs')
const ejs = require('ejs')

const logger = include('lib/logger')
const Sqlizer = include('lib/sqlizer')
const idms = include('lib/idms')
const basicHelper = include('helper/basic-helper')
const idmHelper = include('helper/idm-helper')
const asyncCompare = include('lib/async-compare')
const args = include('lib/args')
const User = include('lib/user')
const DEBUG = args['--debug-plugins']
const CONFIG_MAIN = include('lib/loadconf')('config/main')



function uiOrder(a, b) {
    return a.uiPosition - b.uiPosition
}



// a single plugin
class Plugin {
    constructor({ id, realm, type, name, controller, view }) {
        this.id = id
        this.realm = realm
        this.type = type
        this.name = name
        this.controller = controller
        this.view = view
        this.topic = controller.topic
        this.validEntrytypes = controller.validEntrytypes
        this.validIdms = controller.validIdms
        this.uiPosition = controller.uiPosition || 99999

        if (['entry', 'generic'].includes(type)) {
            this.privilege = User.addPluginPriv(this)
        }
    }


    makeHelper(idmId) {
        return idmHelper.generate({
            idmId: idmId,
            pluginId: this.id,
            addHelper: basicHelper.generate()
        })
    }


    render(idmId, pluginReturn, queryParams, history, mskey) {
        if (!this.view) {
            throw new Error('Cannot render non-ui plugin ' + this.id)
        }

        const idm = idms.get(idmId)
        let helper = this.makeHelper(idmId)

        // entry compare button
        if (history) {
            helper.compareButton = function(tag) {
                return helper.makeCompareButton({ mskey, history, tag })
            }
        }

        // @TODO: generate entry plugin URL too!
        const thisURL = helper.genericPluginURL(this.id)
        const pollURL = thisURL + '/poll'

        return ejs.render(this.view, {
            plugin: pluginReturn,
            helper: helper,
            query: queryParams,
            thisURL: thisURL,
            pollURL: pollURL,
            idmId: idm.id,
            idmName: idm.config.name,
            views: file => path.join(global.appRoot, 'views', file)
        })
    }


    makeQueryFunction(idm) {
        const self = this

        return async function(sqlTemplateName, params) {
            const sqlTemplate = new Sqlizer(util.format('%s_%s', self.id, sqlTemplateName))
            const sql = sqlTemplate.render(params)
            return await idm.query(sql)
        }
    }


    // required for generic plugins: { idm: currentIdmObject, params: req.query }
    // required for entry plugins: {
    //     idm: currentIdmObject,
    //     entry: currentLoadedEntry,
    //     params: req.query,
    //     compareEntry: loaded Entry to compare with, if exists
    // }
    // required for probe plugins: { idm: currentIdmObject }
    async call(par) {
        par.query = this.makeQueryFunction(par.idm)
        par.logger = logger
        par.helper = this.makeHelper(par.idm.id)
        par.compare = asyncCompare
        par.compareTag = par.params && par.params.comparetag ? par.params.comparetag : null

        if (par.params && par.params.compareidm) {
            par.compareQuery = this.makeQueryFunction(idms.get(par.params.compareidm))
        }

        if (CONFIG_MAIN.plugins && CONFIG_MAIN.plugins[this.id]) {
            par.config = CONFIG_MAIN.plugins[this.id]
        }

        return await this.controller.call(par)
    }
}



// all plugins
class Plugins {
    constructor() {
        this.plugins = []

        // import internal plugins
        const INTERNAL_PLUGINS_PATH = path.join(path.resolve(appRoot), 'plugins')
        this.importPathSync(INTERNAL_PLUGINS_PATH)

        // import custom plugins
        if (CONFIG_MAIN.customPluginPath) {
            const CUSTOM_PLUGIN_PATH = CONFIG_MAIN.customPluginPath[0] == '.'
                ? path.join(path.resolve(appRoot), CONFIG_MAIN.customPluginPath)
                : CONFIG_MAIN.customPluginPath

            this.importPathSync(CUSTOM_PLUGIN_PATH)
        }
    }


    // get single plugin by id
    find(id) {
        return this.plugins.find(p => p.id === id)
    }


    // get array of plugins by type
    findAllByType(type) {
        return this.plugins.filter(p => p.type === type).sort(uiOrder)
    }


    findAllByEntryType(entryType) {
        // find plugins enabled for all entrytypes
        let result = this.findAllByType('entry').filter(p => !p.validEntrytypes)

        // find plugins enabled for entryType
        if (entryType !== 'all') {
            result = result.concat(this.findAllByType('entry').filter(function(p) {
                return p.validEntrytypes ? p.validEntrytypes.includes(entryType) : false
            }))
        }

        return result.sort(uiOrder)
    }


    // import one plugin
    importPluginSync(rootPath, pluginName) {
        const pluginPath = path.join(rootPath, pluginName)
        const [realm, type, name] = pluginName.split('-')

        let options = {
            id: pluginName,
            realm: realm,
            type: type,
            name: name
        }

        logger.info('Import plugin: %s', pluginName)
        const sqlTemplateNames = Sqlizer.importPathSync(pluginPath, pluginName)
        const controllerPath = path.join(pluginPath, 'controller.js')

        try {
            options.controller = require(controllerPath)
        }
        catch (err) {
            logger.error(err)
            throw new Error('Loading controller.js failed for plugin: ' + pluginName)
        }

        if (['entry', 'generic'].includes(type)) {
            const viewPath = path.join(pluginPath, 'view.ejs')

            try {
                options.view = fs.readFileSync(viewPath, "utf8")
            }
            catch (err) {
                logger.error(err)
                throw new Error('Loading view.js failed for plugin: ' + pluginName)
            }
        }

        this.plugins.push(new Plugin(options))
    }


    // scann path and import all plugins
    importPathSync(pluginsFolder) {
        try {
            const pluginNames = fs.readdirSync(pluginsFolder).filter(function(entry) {
                return fs.statSync(path.join(pluginsFolder, entry)).isDirectory()
            })

            for (let pName of pluginNames) {
                this.importPluginSync(pluginsFolder, pName)
            }

            if (DEBUG) {
                logger.debug('Loaded plugins: %s', JSON.stringify(this.plugins, null, 4))
            }
        }
        catch (err) {
            logger.error('Loading plugins folder <%s> failled', pluginsFolder)
            logger.error(err)

            if (DEBUG) {
                logger.error(err.stack)
            }

            process.exit(9)
        }
    }
}



// return initialized singleton
module.exports = new Plugins()
