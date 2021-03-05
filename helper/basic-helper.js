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

        helper.spanClass = function(clas, text) {
            return '<span class="' + clas + '">' + text + '</span>'
        }


        helper.provStatusBadge = function(status, name) {
            name = name ? name : status
            status = Number(status)
            let color = 'danger'
            if ([0, 21, 1000, 1100].includes(status)) { color = 'success' }
            if (status == -1) { color = 'warning' }
            if (status == 20) { color = 'info' }
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
