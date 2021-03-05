'use strict'



class Entry {
    constructor(idm, mskey) {
        this.idm = idm
        this.mskey = mskey
        this.entrytype = null
        this.mskeyvalue = null
        this.displayname = null
        this.attributes = null
    }


    async load() {
        this.attributes = await this.idm.queryTemplate('entry-flat', { mskey: this.mskey })
        this.entrytype = this.getAttr('MX_ENTRYTYPE')
        this.mskeyvalue = this.getAttr('MSKEYVALUE')
        this.displayname = this.getAttr('DISPLAYNAME')
        return this.attributes
    }


    getAttr(attrName) {
        const found = this.attributes.find((a) => a.AttrName === attrName)
        return found ? found.aValue : null
    }
}



module.exports = Entry
