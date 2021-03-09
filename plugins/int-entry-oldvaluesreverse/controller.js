'use strict'


module.exports = {
    topic: 'Reverse old values',
    uiPosition: 310,
    validEntrytypes: null,

    call: async function({ entry, query, config, helper, logger }) {
        const oldvalues = await query('oldvaluesreverse', { mskey: entry.mskey })

        return {
            oldvalues
        }
    }
}
