'use strict'

// loadconf.js
// Version 1.0
// YAML config file loader
// (c) 2020 Volker Hehl | MIT License


const fs = require('fs')
const yaml = require('js-yaml')
const path = require('path')
const args = include('lib/args')
const logger = include('lib/logger')

const DEBUG_CONFIG = args['--debug-config']

const appRootPath = path.dirname(require.main.filename)
const configPath = appRootPath
// const configPath = path.join(appRootPath, 'config')

// buffer
let loaded = {}


function loadconf(name) {
    if (loaded[name]) {
        return loaded[name]
    }

    try {
        const filename = name + '.yaml'
        const filePath = path.join(configPath, filename)
        const yamlFile = fs.readFileSync(filePath, 'utf8')
        const obj = yaml.safeLoad(yamlFile)
        loaded[name] = obj

        if (DEBUG_CONFIG) {
            logger.debug('Loading config <%s>:\n%s', filename, JSON.stringify(obj, null, 4))
        }

        return obj
    }
    catch (err) {
        logger.error('Loading config <%s> failled!', name)
        logger.error(err)
        process.exit(9)
    }
}


module.exports = loadconf
