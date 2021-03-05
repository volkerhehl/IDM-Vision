'use strict'


module.exports = {
    call: async function({ idm, query, config, helper, logger }) {
        const result = await query('links')
        const failed = result[0].failed_count

        return {
            points: [{
                measurement: 'idm_links',
                fields: {
                    failed_count: failed
                }
            }]
        }
    }
}
