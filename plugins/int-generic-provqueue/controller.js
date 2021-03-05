'use strict'


module.exports = {
    topic: 'Provisioning Queue',
    uiPosition: 1000,

    call: async function({ idm, query, params, logger, polling }) {
        if (params.taskId) {
            const entries = await query('pqueue-entries', { taskId: params.taskId })
            return { entries }
        }

        const pqueue = await query('pqueue')
        return { pqueue }
    }
}
