'use strict'


// filter properties from objects in array
module.exports = (arr, properties) => arr.map(row => {
    let filtered = {}

    for (let field of properties) {
        filtered[field] = row[field]
    }

    return filtered
})
