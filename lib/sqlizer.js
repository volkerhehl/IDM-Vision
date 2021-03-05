'use strict'

// sqlizer.js - SQL Template Engine
// V 2.0
// 2020 Volker Hehl

const fs = require('fs')
const logger = include('lib/logger')
const args = include('lib/args')
const DEBUG = args['--debug-sqlizer']


// simulated class variable in module scope
let templates = {}


class Sqlizer {
    constructor(templateName) {
        if (templates.hasOwnProperty(templateName)) {
            this.template = templates[templateName]
            this.templateName = templateName
        } else {
            throw('#Sqlizer: unknown template "' + templateName + '"')
        }
    }

    render(params) {
        // ensure string values and defuse apostroph!
        for (let name in params) {
            if (name.split('_')[1] === 'stringlist') {
                // test even parity apostroph count in string lists!
                // @TODO: destruct strings and test separately
                if ((params[name].match(/'/g) || []).length % 2 != 0) {
                    throw new Error('Sqlizer: syntax error in stringlist param')
                }
            }
            else {
                params[name] = String(params[name]).split("'").join("''")
            }
        }

        // validate
        let invalid = false

        for (let name in params) {
            if (this.template.params.hasOwnProperty(name)) {
                let paramRegex = RegExp(this.template.params[name].regex)

                if (!params[name].match(paramRegex)) {
                    logger.error(
                        'Sqlizer: template "' + this.templateName +
                        '" - parameter "' + name +
                        '" failed validation! (value="' + params[name] +
                        '" regex="' + paramRegex + '")'
                    )

                    invalid = true
                }
            } else {
                logger.error(
                    'Sqlizer: template "' + this.templateName +
                    '" - parameter "' + name + '" validation regex missing!'
                )

                invalid = true
            }
        }

        if (invalid) {
            return ''
        }

        let sql = this.template.cleared

        for (let name in params) {
            if (params.hasOwnProperty(name)) {
                sql = sql.replace(new RegExp('\\$\\$' + name + '\\$\\$', 'g'), params[name])
            }
        }

        if (DEBUG) {
            logger.debug('Sqlizer("%s")#render -> %s', this.templateName, sql)
        }

        return sql
    }


    // sync load all templates in basePath
    // names prefixed by prefix + '_' (optional)
    static importPathSync(basePath, prefix) {
        const templateFiles = fs.readdirSync(basePath)
        let templateNames = []

        for (let filename of templateFiles) {
            // only *.sql files!
            if (!filename.endsWith('.sql')) {
                continue
            }

            let template = {}
            template.raw = fs.readFileSync(basePath + '/' + filename, "utf8")
            template.params = {}
            let lines = template.raw.split(/\r?\n/)

            for (let line of lines) {
                // parse parameters and their validation regex
                if (line.match(/--\s*\$\$\w+\$\$\s+\/.*\//)) {
                    // remove leading comment-marks and trailing whitespaces
                    line = line.replace(/^.*--\s*/, '').replace(/\s+$/, '')
                    // get parameter name
                    let param = line.replace(/^[^\$]*\$\$/, '').replace(/\$\$[^\$]*\/.*\/.*$/, '')
                    // get regex
                    let regex = line.replace(/^[^\/]*\//, '').replace(/\/[^\/]*$/, '')

                    // ensure both anchors ..
                    if (!regex.match(/^\^/)) { regex = '^' + regex }
                    if (!regex.match(/\$$/)) { regex = regex + '$' }

                    template.params[param] = {}
                    template.params[param].regex = regex
                }
            }

            // strip to SQL and parameter-letiables only
            template.cleared = lines.filter(function(line) {
                // ignore empty lines and comment-only lines
                return line != '' && !line.match(/^\s*--/)
            }).join(' ')

            let templateName = filename.replace('.sql', '')
            templateNames.push(templateName)

            let fullName = prefix ? prefix + '_' + templateName : templateName
            templates[fullName] = template

            if (DEBUG) {
                logger.debug('Sqlizer template initialized: %s', templateName)
            }
        }

        if (DEBUG) {
            logger.debug(
                'Sqlizer#init current loaded templates:\n' + JSON.stringify(templates, null, 4)
            )
        }

        return templateNames
    }
}

module.exports = Sqlizer
