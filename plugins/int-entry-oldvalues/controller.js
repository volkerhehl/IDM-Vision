'use strict'


module.exports = {
    topic: 'Old values',
    uiPosition: 300,
    validEntrytypes: null,

    call: async function({ entry, query, config, helper, logger }) {
        const oldvalues = await query('oldvalues', { mskey: entry.mskey })

        return {
            oldvalues
        }
    }
}
