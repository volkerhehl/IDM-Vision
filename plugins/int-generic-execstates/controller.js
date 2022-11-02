'use strict'


module.exports = {
    topic: 'Exec States',
    uiPosition: 2000,

    call: async function({ idm, query, params, logger, polling }) {
        const days = params.days ? Number(params.days) : 2
        let summaryAll = query('summary', { days: 0 })
        let summary7 = query('summary', { days: 7 })
        let summary2 = query('summary', { days: 2 })
        let execStates = query('execstates', { days })
        summary2 = await summary2
        summary7 = await summary7
        summaryAll = await summaryAll
        execStates = await execStates
        return { summary2, summary7, summaryAll, execStates, days }
    }
}
