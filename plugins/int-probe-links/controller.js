'use strict'


module.exports = {
    call: async function({ idm, query, config, helper, logger }) {
        const execstates = await query('execstates', { days: 0 })
        const execstates_7d = await query('execstates', { days: 7 })

        return {
            points: [{
                measurement: 'idm_links',
                fields: {
                    failed_count: execstates[0].failed,
                    penadd_count: execstates[0].penadd,
                    pendel_count: execstates[0].pendel,
                    partok_count: execstates[0].partok,
                    failed_7d_count: execstates_7d[0].failed,
                    penadd_7d_count: execstates_7d[0].penadd,
                    pendel_7d_count: execstates_7d[0].pendel,
                    partok_7d_count: execstates_7d[0].partok
                }
            }]
        }
    }
}
