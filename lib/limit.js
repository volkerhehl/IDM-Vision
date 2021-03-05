'use strict'


let limits = {}
let running = {}


function reset(label) {
    limits[label] = new Date().getTime()
}


// returns true on first initializing timeout label, or wehn timout expired
function expired(label, seconds, res = false) {
    if (!limits[label]) {
        reset(label)
        return true
    }

    const timeout = limits[label] + seconds * 1000
    const exp = new Date().getTime() > timeout

    if (exp && res) {
        reset(label)
    }

    return exp
}


// returns false when currently running or still time limited (not expired yet)
// returns callback result when calling successfully
// throws callback errors
// reset timeout only when callback was successfull
async function run(label, seconds, callback) {
    if (running[label] || !this.expired(label, seconds)) return false

    running[label] = true
    let result

    try {
        result = await callback()
        reset(label)
    }
    catch (err) {
        running[label] = false
        throw err
    }

    running[label] = false
    return result
}


module.exports = { reset, expired, run }
