'use strict'

const express = require('express')
const logger = include('lib/logger')
const Menu = include('lib/menu')
const User = include('lib/user')
const adminController = include('controller/admin')
const CONFIG_MAIN = include('lib/loadconf')('config/main')


function initMenus(req, res, next) {
    const adminDropdown = new Menu('admin-dropdown')
    .addItem({
        name: 'Page Views',
        link: '/admin/pageviews',
        display: 'admin-pageviews',
        activate: 'admin-pageviews'
    })
    .addItem({
        name: 'Users',
        link: '/admin/users',
        display: 'admin-users',
        activate: 'admin-users'
    })
    .addItem({
        name: 'Privileges',
        link: '/admin/privs',
        display: 'admin-privs',
        activate: 'admin-privs'
    })
    .addItem({
        name: 'Monitoring',
        link: '/admin/probes',
        display: 'admin-probes',
        activate: Boolean(CONFIG_MAIN.probes)
    })
    .addItem({
        name: 'Logs',
        link: '/admin/logs',
        display: 'admin-logs',
        activate: 'admin-logs'
    })

    res.locals.defs.menus.admin = new Menu('admin-menu')
    .addMenu({
        menu: adminDropdown,
        name: 'Admin'
    })

    if (res.locals.user && res.locals.user.priv('admin-logs')) {
        const errorCount = logger.count('error', new Date(Date.now() - 1000 * 60 * 60 * 24))

        if (errorCount > 0) {
            res.locals.defs.menus.admin
            .addItem({
                name: '(!)',
                link: '/admin/logs',
                display: true,
                activate: true
            })
        }
    }

    next && next()
}


const adminRouter = express.Router()

adminRouter.get('/pageviews', User.pass('admin-pageviews'), adminController.pageviews)
adminRouter.get('/users', User.pass('admin-users'), adminController.users)
adminRouter.get('/privs', User.pass('admin-privs'), adminController.privs)
adminRouter.get('/logs', User.pass('admin-logs'), adminController.logs)

if (CONFIG_MAIN.probes) {
    adminRouter.get('/probes', User.pass('admin-probes'), adminController.probes)
}

exports.mount = adminRouter
exports.initMenus = initMenus

