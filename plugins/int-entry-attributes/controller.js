'use strict'


module.exports = {
    // tab name in the UI
    topic: 'Attributes',

    // default UI tab position
    uiPosition: 100,

    // null = plugin enabled for all entrytypes
    // define an array with entrytypes to enable the plugin only for this entrytypes
    validEntrytypes: null,

    // the main function should return an object that contains all data
    // which consumed directly by the view template in its local "plugin"
    // all flat attributes just available in entry.attributes
    call: async function({ entry, query, config, logger, params, compareEntry, helper, compare }) {
        function trim(attributes) {
            if (config && config.trimLongAttributes) {
                return attributes.map(function(row) {
                    if (config.trimLongAttributes.includes(row.AttrName)) {
                        row.aValue = row.aValue.substr(0, 40) + ' ...'
                    }

                    return row
                })
            }

            return attributes
        }

        const attributes = trim(entry.attributes)

        if (compareEntry) {
            const compareAttributes = trim(compareEntry.attributes)

            const compared = await compare({
                fields: ['AttrName', 'aValue', 'Modifytime'],
                a: attributes,
                b: compareAttributes,

                cmp: (a, b) => {
                    a = a.AttrName + a.aValue.toLowerCase()
                    b = b.AttrName + b.aValue.toLowerCase()
                    if (a < b) return -1
                    if (a > b) return 1
                    return 0
                }
            })

            return { entry, compareEntry, compared }
        }

        return { attributes }
    }
}
