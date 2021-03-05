'use strict'


module.exports = {
    topic: 'Approval history',
    uiPosition: 700,
    validEntrytypes: null,

    call: async function({ entry, query, config, helper, logger }) {
        const approvalHistory = await query('approvalhistory', { mskey: entry.mskey })

        return {
            approvalHistory
        }
    }
}
