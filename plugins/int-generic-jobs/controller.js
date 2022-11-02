'use strict'


module.exports = {
    topic: 'Jobs',
    uiPosition: 501,

    call: async function({ idm, query, params, logger, polling }) {
        const all = params.all ? '1' : '0'
        const jobs = await query('jobs', { all })
        return { jobs }
    }
}
