(function(exports){
    const PROCESSINFO_JOB_REGEX = /jobid\s*=\s*(\d+)/i
    const PROCESSINFO_MSKEY_REGEX = /^\D*(\d+)\D*$/i


    exports.generate = function({ idmId, addHelper, pluginId }) {
        if (!idmId) {
            throw new Error('Missing idmId')
        }

        let helper = addHelper ? Object.assign({}, addHelper) : {}


        helper.baseURL = function(add = '') {
            return '/idm/' + idmId + add
        }


        helper.mskeyURL = function(mskey) {
            return helper.baseURL('/mskey/' + mskey)
        }


        helper.genericPluginURL = function(pluginID = pluginId, add = '') {
            return helper.baseURL('/' + pluginID + add)
        }


        helper.entryPluginURL = function(mskey, pluginID = pluginId, add = '') {
            return helper.mskeyURL(mskey) + (pluginID ? '/' + pluginID : '') + add
        }


        helper.entryPluginFromQueryURL = function(mskey, pluginID = pluginId) {
            pluginID = pluginID ? encodeURIComponent(pluginID) : null
            return helper.entryPluginURL(mskey, pluginID)
        }


        helper.entrySearchURL = function(idstore, attribute, searchvalue, limit) {
            let url = helper.baseURL()
            url += '?idstore=' + encodeURIComponent(idstore)

            if (attribute) {
                url += '&attribute=' + encodeURIComponent(attribute)
            }

            if (searchvalue) {
                url += '&searchvalue=' + encodeURIComponent(searchvalue)
            }

            if (limit) {
                url += '&limit=' + encodeURIComponent(limit)
            }

            return url
        }


        helper.makeMskeyLink = function(mskey, text) {
            return mskey && text ? helper.makeLink(helper.mskeyURL(mskey), text) : ''
        }


        helper.makeMskeyLinkInline = function(mskey, text) {
            return mskey && text ? helper.makeLinkInline(helper.mskeyURL(mskey), text) : ''
        }


        helper.makeMskeyValueLink = function(mskeyvalue) {
            // @TODO: Link!
            return mskeyvalue
        }


        helper.regexURL = function(text, regex, linkPrefix) {
            const match = text ? text.match(regex) : null
            const id = match && match.length > 1 ? match[1] : null
            return id ? helper.baseURL(linkPrefix + id) : null
        }


        helper.makeProcessInfoLink = function(text) {
            if (text && text.trim() == "0") {
                return text
            }

            let link = helper.regexURL(text, PROCESSINFO_JOB_REGEX, '/int-generic-jobtask?searchId=')
            link = link ? link : helper.regexURL(text, PROCESSINFO_MSKEY_REGEX, '/mskey/')
            return link ? helper.makeLink(link, text) : text
        }


        helper.makeJobTaskIdLink = function(id, text) {
            if (id) {
                return helper.makeLink(
                    helper.genericPluginURL('int-generic-jobtask', '?searchId=' + id),
                    text
                )
            }

            return ''
        }


        helper.makeCompareButton = function({ mskey, history, tag, classAdd = 'dropdown-sm' } = {}) {
            if (!history || history.length == 0) {
                return ''
            }

            const id = 'dropdownCompareButton' + (tag ? tag : '')
            let links = []

            for (let h of history) {
                if (h === null) {
                    links.push('<div class="dropdown-divider"></div>')
                }
                else {
                    links.push(
                        '<a class="dropdown-item" href="'
                        + helper.entryPluginURL(
                            mskey,
                            pluginId,
                            '?comparemskey=' + h.mskey
                            + '&compareidm=' + h.idmID
                            + (tag ? '&comparetag=' + tag : '')
                        ) + '">'
                        + h.idmName + ' - ' + h.entrytype + ' - ' + h.mskeyvalue + ' - '
                        + h.displayname + '</a>'
                    )
                }
            }

            return '<span class="dropdown">'
                + '<button type="button" class="btn btn-secondary btn-sm dropdown-toggle"'
                + ' id="' + id + '" data-toggle="dropdown" aria-haspopup="true"'
                + ' aria-expanded="false">COMPARE</button>'
                + '<div class="dropdown-menu dropdown-menu-right'
                + (classAdd ? ' ' + classAdd : '') + '" aria-labelledby="' + id + '">'
                + links.join('')
                + '</div>'
                + '</span>'
        }


        return helper
    }
})(typeof exports === 'undefined' ? this['idmhelper'] = {} : exports)
