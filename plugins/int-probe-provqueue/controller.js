'use strict'

const COMMON_STATES = [1, 2, 5, 21, 22, 24, 37]


module.exports = {
    call: async function({ idm, query, config, helper, logger }) {
        let knownStateCount = 0

        let fields = {
            overall_count: 0
        }

        function name(state) {
            return 'state_' + state + '_count'
        }

        for (const state of COMMON_STATES) {
            fields[name(state)] = 0
        }

        const pqueue = await query('pqueue')

        for (const row of pqueue) {
            fields.overall_count += row.count

            if (COMMON_STATES.includes(row.state)) {
                knownStateCount += row.count
                fields[name(row.state)] = row.count
            }
        }

        fields.state_unknown_count = fields.overall_count - knownStateCount

        const point = {
            measurement: 'idm_provisioning_queue',
            fields: fields
        }

        return {
            points: [point]
        }
    }
}
