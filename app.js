'use strict'

global.appRoot = __dirname
global.include = name => require(__dirname + '/' + name)

const path = require('path')
const express = require('express')
const expressLayouts = require('express-ejs-layouts')
const http = require('http')
const CJSON = require('circular-json')
const socketIO = require('socket.io')
const useragent = require('express-useragent')

const PACKAGE = include('package')
const appName = PACKAGE.name.replace('-', ' ')
const appVersion = PACKAGE.version

const logger = include('lib/logger')
logger.info('%s %s says "Hello"', appName, appVersion)

const args = include('lib/args')
const CONFIG_MAIN = include('lib/loadconf')('config/main')

// import basic SQL templates ..
const Sqlizer = include('lib/sqlizer')
Sqlizer.importPathSync('./sql')

const idmRouter = include('router/idm')
const adminRouter = include('router/admin')
const trimRequest = include('lib/trim-request')
const Menu = include('lib/menu')
const auth = include('middleware/auth')
const stats = include('middleware/stats')
const basicHelper = include('helper/basic-helper')
const idms = include('lib/idms')
const plugins = include('lib/plugins')
const eventhub = include('lib/eventhub')
const probesPromise = CONFIG_MAIN.probes && include('lib/probes')


function initLocals(req, res, next) {
    res.locals.vars = {
        appName: appName,
        titleAdd: '',
        menus: {},
        useragent: req.useragent
    }

    res.locals.defs = {
        menus: {}
    }

    res.locals.debugFlag = args['--debug']
    res.locals.helper = basicHelper.generate()
    res.locals.CJSON = CJSON
    next()
}


// intercept render function using prototype shadowing pattern
// do things just before render and catch errors ..
function renderInterceptor(req, res, next) {
    const render = res.render

    res.render = function(view, locals, cb) {
        try {
            if (res.locals.user) {
                // init menus
                idmRouter.initMenus(req, res)
                adminRouter.initMenus(req, res)

                // build menus
                if (res.locals.defs && res.locals.defs.menus) {
                    for (let menu in res.locals.defs.menus) {
                        res.locals.vars.menus[menu] = res.locals.defs.menus[menu].build({
                            user: res.locals.user
                        })
                    }
                }
            }

            // count requests
            stats.countRequests(req, res, view)
        }
        catch (err) {
            logger.error(err)
            res.locals.vars.error = err
        }

        render.call(res, view, locals, cb)
    }

    next()
}


function disableIE(req, res, next) {
    if (req.useragent.browser === 'IE') {
        return res.render('unsupported-ie', { layout: false })
    }

    next()
}


const app = express()
const server = http.createServer(app)
const io = socketIO(server)
eventhub.mount(io)


try {
    app.set('view engine', 'ejs')
    app.use(expressLayouts)
    app.use(express.static('public'))
    app.use(useragent.express())
    app.use('/js', express.static('helper'))
    app.use('/js', express.static('node_modules/vue/dist'))
    app.use(trimRequest('query'))
    app.use(initLocals)
    app.use(renderInterceptor)
    auth(app)
    app.use(disableIE)
    app.use('/idm', idmRouter.mount)
    app.use('/admin', adminRouter.mount)
    app.get('/', (req, res) => res.redirect('/idm'))

    server.listen(CONFIG_MAIN.port, async function () {
        logger.info('IDM Vision listening on port %s', CONFIG_MAIN.port)
    })
}
catch (err) {
    logger.error(err.stack)
}
