'use strict'


module.exports = {
    topic: 'Job Log',
    uiPosition: 500,

    call: async function({ idm, query, params, logger, polling }) {
        if (polling) {
            return await idm.getJobLog({ fromId: params.from, max: 250 })
        }
    }
}
