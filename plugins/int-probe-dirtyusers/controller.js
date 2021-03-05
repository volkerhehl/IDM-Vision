'use strict'


module.exports = {
    call: async function({ idm, query, config, helper, logger }) {
        const result = await query('dirtyusers')
        const dirtyUserCount = result[0].count

        return {
            points: [{
                measurement: 'idm_users',
                fields: {
                    dirty_count: dirtyUserCount
                }
            }]
        }
    }
}
