'use strict'


module.exports = {
    call: async function({ idm, query, config, helper, logger }) {
        const result = await query('jobs')

        let fields = {
            runtime_max: 0
        }

        fields.active_count = result[0].active_count
        fields.bad_state_count = result[0].bad_state_count

        if (fields.active_count > 0) {
            fields.runtime_max = result[0].runtime_max
        }

        return {
            points: [{
                measurement: 'idm_jobs',
                fields: fields
            }]
        }
    }
}
