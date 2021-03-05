'use strict'


module.exports = {
    topic: 'Audit log',
    uiPosition: 400,
    validEntrytypes: null,

    call: async function({ entry, query, config, helper, logger }) {
        const auditlog = await query('auditlog', { mskey: entry.mskey })

        return {
            auditlog
        }
    }
}
