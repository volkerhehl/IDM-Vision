'use strict'

// menu.js (Boilerplate)
// Version 1.0
// Menu objects, to use with menu/* views
// (c) 2020 Volker Hehl | MIT License


const logger = include('lib/logger')



class Menu {
    constructor(id) {
        if (typeof id !== 'string') {
            throw new Error('<id> must be a string')
        }

        this.id = id
        this.content = []
    }


    // Add an menu item
    addItem({ id, name, link, display, activate, selected }) {
        if (typeof name !== 'string') {
            throw new Error('<name> must be a string')
        }

        if (typeof link !== 'string' && typeof link !== 'function') {
            throw new Error('<link> must be a string or a function which returns a string')
        }

        if (typeof display !== 'string' && display !== true) {
            throw new Error('<display> must be true or a string (privilege)')
        }

        if (typeof activate !== 'string' && typeof activate !== 'boolean') {
            throw new Error('<activate> must be false, true or a string (privilege)')
        }

        this.content.push({
            type: 'item',
            id: id,
            name: name,
            link: link,
            display: display,
            activate: activate,
            selected: selected
        })

        return this
    }


    // Add a sub menu object
    addMenu({ id, name, menu }) {
        menu.parrent = this

        this.content.push({
            type: 'menu',
            id: id,
            name: name,
            menu : menu
        })

        return this
    }


    // Add a section menu object, which compiles to a flat list (grouping)
    addSection({ id, name, menu }) {
        menu.parrent = this

        this.content.push({
            type: 'section',
            id: id,
            menu : menu
        })

        return this
    }


    // Add a divider for dropdowns
    addDivider(id) {
        this.content.push({
            type: 'divider',
            id: id
        })

        return this
    }


    // Build menu structure to use with menu/* templates
    build({ user } = {}) {
        if (!user) {
            throw new Error('Menu#build() missing user')
        }

        let content = []
        let lastType

        for (let el of this.content) {
            if (el.type === 'divider') {
                if (!lastType || lastType === 'divider') {
                    continue
                }
            }

            if (el.type === 'item' && el.display !== true && !user.priv(el.display)) {
                continue
            }

            if (el.type == 'section') {
                const compiled = el.menu.build({ user: user })

                for (let sel of compiled.content) {
                    lastType = el.type
                    content.push(sel)
                }
            }
            else {
                let element = {
                    type: el.type,
                    id: el.id
                }

                if (el.name) {
                    element.name = el.name
                }

                if (el.link) {
                    if (typeof el.link == 'function') {
                        element.link = el.link()
                    }
                    else {
                        element.link = el.link
                    }
                }

                if (el.menu) {
                    const menu = el.menu.build({ user: user })

                    if (menu.content.length == 0) {
                        continue
                    }

                    element.active = true
                    element.menu = menu
                }

                if (el.type === 'item') {
                    if (typeof el.activate === 'boolean') {
                        element.active = el.activate
                    }
                    else {
                        element.active = user.priv(el.activate)
                    }

                    element.selected = el.selected
                }

                lastType = el.type
                content.push(element)
            }
        }

        if (content.length > 0 && content[content.length - 1].type == 'divider') {
            content.pop()
        }

        return {
            id: this.id,
            content: content
        }
    }
}



module.exports = Menu
