(function(exports){
    const EMPHASIS_CLASSES = [
        'muted',
        'primary',
        'secondary',
        'warning',
        'danger',
        'success',
        'info'
    ]

    exports.generate = function({ addHelper } = {}) {
        let helper = addHelper ? Object.assign({}, addHelper) : {}


        helper.dateFormat = function(date) {
            if (!date) {
                return ''
            }

            return new Date(date).toISOString().substr(0,19).replace('T', '_')
        }


        helper.badge = function(color, text) {
            return '<span class="badge badge-' + color + '">' + text + '</span>'
        }


        helper.unistate = function(state) {
            state = Number(state)
            return state > 1023 ? state - 1024 : state
        }


        helper.linkStateName = function(state) {
            const ustate = helper.unistate(state)
            const pending = state > 1023 ? 'PENDEL: ' + state : 'PENADD: ' + state

            switch (ustate) {
                case 0: return 'OKAY: ' + state
                case 1: return 'OK: ' + state
                case 2: return 'REJECT: ' + state
                case 4: return 'FAIL: ' + state
                case 512: return pending
                default: return '???: ' + state
            }
        }


        helper.execStateName = function(state) {
            const ustate = helper.unistate(state)
            const pending = state > 1023 ? 'PENDEL: ' + state : 'PENADD: ' + state

            switch (ustate) {
                case 0: return 'OKAY: ' + state
                case 1: return 'OK: ' + state
                case 2: return 'REJECT: ' + state
                case 3: return 'PARTIAL: ' + state
                case 4:
                case 5:
                case 6:
                case 7: return 'FAILED: ' + state
                case 512:
                case 513:
                case 514:
                case 515:
                case 516:
                case 517:
                case 518:
                case 519: return pending
                default: return '???: ' + state
            }
        }


        helper.linkStateColor = function(state) {
            const ustate = helper.unistate(state)
            if (ustate < 2) { return 'success' }
            if (ustate > 3 && ustate < 512) { return 'danger' }
            return 'warning'
        }


        helper.execStateColor = function(state) {
            const ustate = helper.unistate(state)
            if (ustate < 2) { return 'success' }
            if (ustate > 3 && ustate < 512) { return 'danger' }
            return 'warning'
        }


        helper.linkStateBadge = function(state) {
            return helper.badge(helper.linkStateColor(state), helper.linkStateName(state))
        }


        helper.execStateBadge = function(state) {
            return helper.badge(helper.execStateColor(state), helper.execStateName(state))
        }


        helper.spanClass = function(clas, text) {
            return '<span class="' + clas + '">' + text + '</span>'
        }


        helper.spanColor = function(color, text) {
            return helper.spanClass('text-' + color, text)
        }


        helper.provStatusBadge = function(status, name) {
            name = name ? name : status
            status = Number(status)
            let color = 'danger'
            if ([0, 1000, 1100].includes(status)) { color = 'success' }
            if (status == -1) { color = 'warning' }
            if (status == 20) { color = 'info' }
            if (status == 21) { color = 'info' }
            return helper.badge(color, name)
        }


        helper.emphaseText = function(text) {
            if (arguments.length < 2) {
                throw new Error('too less arguments!')
            }

            for (let i = 1; i < arguments.length; i++) {
                if (!EMPHASIS_CLASSES.includes(arguments[i][1])) {
                    throw new Error('invalid emphasis class ' + arguments[i][1])
                }

                text = text
                .split(arguments[i][0])
                .join('<span class="text-' + arguments[i][1] + '">' + arguments[i][0] + '</span>')
            }

            return text
        }


        helper.makeLink = function(link, text) {
            return '<div class="dotlinkbox"><div class="dotlinkcontent"><a href="'
                + link
                + '"><span class="linkdot"></span></a>'
                + text
                + '</div></div>'
        }


        helper.makeLinkInline = function(link, text) {
            return '<span class="dotlinkcontent"><a href="'
                + link
                + '"><span class="linkdot"></span></a>'
                + text
                + '</span>'
        }


        helper.escapeHTML = function(text) {
            return text
                .split('&').join('&amp;')
                .split('<').join('&lt;')
                .split('>').join('&gt;')
        }


        return helper
    }
})(typeof exports === 'undefined' ? this['basichelper'] = {} : exports)
