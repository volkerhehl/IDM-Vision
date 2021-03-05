'use strict'

const util = require('util')
const Sqlizer = include('lib/sqlizer')
const logger = include('lib/logger')

const CONFIG_MAIN = include('lib/loadconf')('config/main')
const DEFAULT_MAX_SEARCH_ROWS = 1000

let TOP_SEARCH_ATTRIBUTES = [
    '*',
    'MSKEY',
    'MSKEYVALUE',
    'DISPLAYNAME'
]

if (CONFIG_MAIN.additionalTopSearchAttributes) {
    TOP_SEARCH_ATTRIBUTES = TOP_SEARCH_ATTRIBUTES.concat(
        CONFIG_MAIN.additionalTopSearchAttributes
    )
}


async function searchController(req, res, next) {
    try {
        const idm = res.locals.defs.idm
        const attributes = await idm.getAttributes()
        const idstores = await idm.getIdStores()
        const searchAttributes = attributes.filter(a => !TOP_SEARCH_ATTRIBUTES.includes(a))
        res.locals.vars.searchAttributes = TOP_SEARCH_ATTRIBUTES.concat(searchAttributes)
        res.locals.vars.searchIdstores = idstores
        res.locals.vars.maxSearchRows = req.query.limit || DEFAULT_MAX_SEARCH_ROWS

        if (req.query.searchvalue) {
            const likevalue = req.query.searchvalue
                .split('[').join('[[]')
                .split('_').join('[_]')
                .split('%').join('[%]')
                .split('*').join('%')

            const idstoreId = res.locals.vars.idstore || idstores[0].IS_ID
            let sql

            if (res.locals.vars.attribute) {
                if (res.locals.vars.attribute === 'MSKEY') {
                    let mskey = Number(req.query.searchvalue)

                    if (isNaN(mskey)) {
                        res.locals.vars.entries = []
                        res.render('search')
                        return
                    }

                    const link = res.locals.helper.entryPluginFromQueryURL(
                        mskey,
                        req.query.entryPlugin
                    )

                    res.redirect(link)
                    return
                }
                else {
                    sql = new Sqlizer('search-attr').render({
                        attr: res.locals.vars.attribute,
                        searchvalue: likevalue,
                        maxrows: res.locals.vars.maxSearchRows,
                        idstore: idstoreId
                    })
                }
            }
            else {
                sql = new Sqlizer('search').render({
                    searchvalue: likevalue,
                    maxrows: res.locals.vars.maxSearchRows,
                    idstore: idstoreId
                })
            }

            const result = await idm.query(sql)

            if (result.length == 1) {
                const link = res.locals.helper.entryPluginFromQueryURL(
                    result[0].MSKEY,
                    req.query.entryPlugin
                )

                res.redirect(link)
                return
            }

            if (!['MX_ENTRYTYPE', 'MSKEYVALUE', 'DISPLAYNAME'].includes(res.locals.vars.attribute)) {
                res.locals.vars.aValueAttr = res.locals.vars.attribute
            }

            res.locals.vars.entries = result
        }
    }
    catch (err) {
        logger.error(err)
        res.locals.vars.error = err
    }

    res.render('search')
}


module.exports = searchController
