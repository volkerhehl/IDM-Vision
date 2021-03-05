'use strict'


module.exports = {
    topic: 'Provisioning status',
    uiPosition: 500,
    validEntrytypes: null,

    call: async function({ entry, query, config, helper, logger }) {
        const provStatus = await query('provstat', { mskey: entry.mskey })

        return {
            provStatus
        }
    }
}
