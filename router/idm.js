'use strict'

const path = require('path')
const util = require('util')
const express = require('express')

const logger = include('lib/logger')
const idms = include('lib/idms')
const idmHelper = include('helper/idm-helper')
const plugins = include('lib/plugins')
const Menu = include('lib/menu')
const User = include('lib/user')

const searchController = include('controller/idm-search')
const entryController = include('controller/idm-entry')
const pluginController = include('controller/idm-plugin')


function initMenus(req, res, next) {
    // cross idm link builder for idm change dropdown
    function xLink(idmId) {
        let link = '/idm/' + idmId

        if (req.params.genericPlugin) {
            link += '/' + req.params.genericPlugin
        }

        let queryClone = Object.assign({}, req.query)

        if (req.params.mskey && res.locals.vars.mskeyvalue) {
            queryClone.attribute = 'MSKEYVALUE'
            queryClone.searchvalue = res.locals.vars.mskeyvalue

            if (req.params.genericPlugin) {
                queryClone.genericPlugin = req.params.genericPlugin
            }

            if (req.params.entryPlugin) {
                queryClone.entryPlugin = req.params.entryPlugin
            }
        }

        if (Object.keys(queryClone).length > 0) {
            link += '?' + Object.keys(queryClone)
                .map(k => k + '=' + encodeURIComponent(queryClone[k]))
                .join('&')
        }

        return link
    }

    let idmSelectorMenu = new Menu('idm-selector-menu')
    let genericPluginsSection = new Menu('idm-generic-plugins-section')
    const idmList = idms.list()
    let currentRealm = idmList[0].realm
    const firstIdm = idms.first()
    const currentIdm = res.locals.vars.currentIdm
    const currentIdmId = res.locals.vars.idmId
    const plugin = plugins.find(req.params.genericPlugin)
    const validIdms = plugin && plugin.validIdms ? plugin.validIdms : idms.ids()

    for (let idm of idmList) {
        if (idm.realm != currentRealm) {
            idmSelectorMenu.addDivider()
            currentRealm = idm.realm
        }

        idmSelectorMenu.addItem({
            name: util.format('%s - %s', idm.name, idm.description),
            link: () => xLink(idm.id),
            display: true,
            activate: validIdms.includes(idm.id)
        })
    }

    res.locals.defs.menus.main = new Menu('main-menu')
    .addMenu({
        menu: idmSelectorMenu,
        name: util.format(
            '%s %s',
            currentIdm ? currentIdm.name : 'Select IDM',
            currentIdm ? ' - ' + currentIdm.description : ''
        )
    })
    .addItem({
        name: 'Search Entry',
        link: '/idm' + (currentIdmId ? '/' + currentIdmId : ''),
        display: 'search-entry',
        activate: 'search-entry'
    })
    .addSection({
        menu: genericPluginsSection
    })

    for (let plugin of plugins.findAllByType('generic')) {
        genericPluginsSection.addItem({
            name: plugin.topic,
            link: util.format(
                '/idm/%s/%s%s',
                res.locals.vars.idmId,
                plugin.id,
                plugin.controller.urlAddDefault ? plugin.controller.urlAddDefault : ''
            ),
            display: plugin.privilege,
            activate: plugin.privilege
        })
    }

    next && next()
}


function initLocals(req, res, next) {
    let idm = idms.getOrFirst(req.params.idm.toLowerCase())
    const plugin = plugins.find(req.params.genericPlugin)

    if (plugin && plugin.validIdms && !plugin.validIdms.includes(idm.id)) {
        idm = idms.get(plugin.validIdms[0].toLowerCase())
    }

    res.locals.vars.idmId = idm.id
    res.locals.vars.mskey = req.params.mskey ? Number(req.params.mskey) : null

    const attribute = req.query.attribute && req.query.attribute != '*'
        ? req.query.attribute.toUpperCase()
        : null

    res.locals.vars.attribute = attribute
    res.locals.vars.idstore = req.query.idstore
    const searchvalue = req.query.searchvalue
    res.locals.vars.searchvalue = searchvalue
    res.locals.vars.idms = idms.list()

    res.locals.vars.currentIdm = idm.asListEntry()

    // page title ..
    res.locals.vars.titleAdd += res.locals.vars.currentIdm.name

    if (searchvalue) {
        res.locals.vars.titleAdd += ' - Search: '
        res.locals.vars.titleAdd += attribute && attribute != '*' ? attribute + ': ' : ''
        res.locals.vars.titleAdd += searchvalue ? searchvalue : ''
    }

    res.locals.defs.idm = idm
    res.locals.helper = { ...res.locals.helper, ...idmHelper.generate({ idmId: idm.id }) }
    next()
}


const idmRouter = express.Router()

idmRouter.get('/', (req, res) => res.redirect('/idm/' + idms.firstId()))

idmRouter.all([
    '/:idm',
    '/:idm/mskey/:mskey',
    '/:idm/mskey/:mskey/:entryPlugin',
    '/:idm/mskey/:mskey/:entryPlugin/poll',
    '/:idm/:genericPlugin',
    '/:idm/:genericPlugin/poll'
], initLocals)

idmRouter.get('/:idm', User.pass('search-entry'), searchController)

idmRouter.get([
    '/:idm/mskey/:mskey',
    '/:idm/mskey/:mskey/:entryPlugin',
    '/:idm/mskey/:mskey/:entryPlugin/poll'
], entryController)

idmRouter.get('/:idm/:genericPlugin', pluginController.base)
idmRouter.get('/:idm/:genericPlugin/poll', pluginController.poll)

exports.mount = idmRouter
exports.initMenus = initMenus
