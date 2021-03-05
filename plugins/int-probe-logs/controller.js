'use strict'


module.exports = {
    call: async function({ idm, query, config, helper, logger }) {
        const result = await query('dispatcherlog')

        return {
            points: [{
                measurement: 'idm_logs',
                fields: {
                    disp_fatal_err_10m: result[0].fatal_err_10m,
                    disp_fatal_err_24h: result[0].fatal_err_24h
                }
            }]
        }
    }
}
