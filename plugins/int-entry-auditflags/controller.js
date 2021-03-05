'use strict'


module.exports = {
    topic: 'Audit flags',
    uiPosition: 600,
    validEntrytypes: null,

    call: async function({ entry, query, config, helper, logger }) {
        const auditflags = await query('auditflags', { mskey: entry.mskey })
        const auditFlags = auditflags.filter(a => a.history == 0)
        const afHistory = auditflags.filter(a => a.history == 1)

        return {
            auditFlags,
            afHistory
        }
    }
}
