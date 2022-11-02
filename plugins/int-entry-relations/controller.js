'use strict'


module.exports = {
    topic: 'Relations',
    uiPosition: 200,
    validEntrytypes: null,

    call: async function({ entry, query, compareEntry, compareQuery, compareTag, compare, idm, logger }) {
        let logonAliasAttr = 'MX_LOGONALIAS'
        let samAccountAttr = 'ISV_SAMACCOUNTNAME'

        if (idm.mvn === 8) {
            logonAliasAttr = 'ISV_LOGINID'
        }

        const relations = await query('relations', { mskey: entry.mskey, logon_alias_attr: logonAliasAttr, sam_account_attr: samAccountAttr })
        const fromEntry = relations.filter(r => r.direction == 'from')
        const toEntry = relations.filter(r => r.direction == 'to')
        const requestCount = relations.filter(r => r.direction == 'to' && r.MSKEYVALUE.length > 2 && r.MSKEYVALUE.substr(0,3) == 'RQ:').length
        let from = {}
        let to = {}
        from.invRef = fromEntry.filter(r => r.mcAssignedDirect < 1 && r.mcAssignedDynamicGroup < 1 && r.mcAssignedInheritCount < 1).length > 0
        to.invRef = toEntry.filter(r => r.mcAssignedDirect < 1 && r.mcAssignedDynamicGroup < 1 && r.mcAssignedInheritCount < 1).length > 0
        from.badExec = fromEntry.filter(r => (r.mcExecState != 0 && r.mcExecState != 1)).length > 0
        to.badExec = toEntry.filter(r => (r.mcExecState != 0 && r.mcExecState != 1)).length > 0

        if (compareEntry) {
            compareTag = compareTag ? compareTag : 'from'
            let compareRelations = await compareQuery('relations', { mskey: compareEntry.mskey })
            compareRelations = compareRelations.filter(r => r.direction == compareTag)

            const compared = await compare({
                fields: ['AttrName', 'entrytype', 'MSKEYVALUE', 'MSKEY', 'DISPLAYNAME'],
                a: compareTag === 'to' ? toEntry : fromEntry,
                b: compareRelations,

                cmp: (a, b) => {
                    a = (a.AttrName + a.MSKEYVALUE).toLowerCase()
                    b = (b.AttrName + b.MSKEYVALUE).toLowerCase()
                    if (a < b) return -1
                    if (a > b) return 1
                    return 0
                }
            })

            const title = compareTag === 'to' ? 'To this entry' : 'From this entry'
            return { entry, compareEntry, compared, title }
        }

        return {
            fromEntry,
            toEntry,
            from,
            to,
            requestCount
        }
    }
}
