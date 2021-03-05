'use strict'

const logger = include('lib/logger')
const MAX_HISTORY_SIZE = 20



class History {
    constructor() {
        this.entries = []
    }


    find(entry) {
        return this.entries.find(e =>
            e.idmID === entry.idm.id &&
            e.mskey === entry.mskey
        )
    }


    list(entry) {
        let f1 = this.entries.filter(e => !(
            e.idmID === entry.idm.id &&
            e.mskey === entry.mskey
        ))

        f1.reverse()
        let f2 = f1.filter(e => e.entrytype === entry.entrytype)
        let f3 = f1.filter(e => e.entrytype !== entry.entrytype)
        let f21 = f2.filter(e => e.idmID === entry.idm.id)
        let f22 = f2.filter(e => e.idmID !== entry.idm.id)

        if (f21.length > 0 && f22.length > 0) {
            f21.push(null)
        }

        if (f2.length > 0 && f3.length > 0) {
            f22.push(null)
        }

        return f21.concat(f22.concat(f3))
    }


    // add entry to history
    register(entry) {
        if (!this.find(entry)) {
            this.entries.push({
                idmID: entry.idm.id,
                idmName: entry.idm.name,
                mskey: entry.mskey,
                entrytype: entry.entrytype,
                mskeyvalue: entry.mskeyvalue,
                displayname: entry.displayname,
                timestamp: new Date()
            })

            if (this.entries.length > MAX_HISTORY_SIZE) {
                this.entries.shift()
            }
        }

        return this.list(entry)
    }


    // list({ idm } = {}) {
    //     return this.entries.filter(b => !idm || b.idmID === idm.id)
    // }
}



module.exports = History
