'use strict'

function trimObject(obj) {
    if (!obj || typeof obj != 'object') {
        return
    }

    for (let p in obj) {
        if (typeof obj[p] == 'object') {
            trimObject(obj[p])
            return
        }
        else if (typeof obj[p] == 'string') {
            obj[p] = obj[p].trim()
        }
    }
}

function trimRequest(prop) {
    if (!['query', 'params', 'body'].includes(prop)) {
        throw new Error('Invalid request property')
    }

    return function(req, res, next) {
        if (req[prop]) {
            trimObject(req[prop])
        }

        next()
    }
}


module.exports = trimRequest
