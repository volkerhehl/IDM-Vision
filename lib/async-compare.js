'use strict'

const diffSort = include('lib/diffsort')
const propFilter = include('lib/propfilter')


module.exports = async function({ fields, a, b, cmp }) {
    if (fields) {
        a = propFilter(a, fields)
        b = propFilter(b, fields)
    }

    // TODO: sort non blocking
    const diffed = diffSort(a, b, cmp)
    return diffed
}
