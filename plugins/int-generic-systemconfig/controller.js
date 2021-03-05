'use strict'


function condense(text, sv, arround = 5) {
    if (!text) {
        return []
    }

    const lines = text.split('\r').join('').split('\n')
    let condensed = []
    let preload = []
    let postload = 0
    let first = true

    for (let i in lines) {
        let l = lines[i]
        let nl = String(i) + ': ' + l
        preload.push(nl)

        if (preload.length > arround + 1) {
            preload.shift()
        }

        if (l.toLowerCase().includes(sv)) {
            if (first) {
                first = false
            }
            else if (postload == 0) {
                condensed.push('')
            }

            condensed = condensed.concat(preload)
            preload = []
            postload = arround
        }
        else if (postload > 0) {
            postload--
            condensed.push(nl)
            preload = []
        }
    }

    return condensed.join('\n')
}


module.exports = {
    topic: 'Search System Config',
    uiPosition: 150,
    urlAddDefault: '?globalVars=on&jobVars=on&repoVars=on&globalScripts=on&jobs=on',

    call: async function({ idm, query, params, logger, polling, helper }) {
        let result = {}

        if (params.searchValue && params.searchValue.length > 2) {
            await idm.updateSystemConfig()
            const sv = params.searchValue.toLowerCase()

            if (params.globalVars) {
                result.globalVars = idm.globalVars.filter(s =>
                    (s.VARNAME && s.VARNAME.toLowerCase().includes(sv)) ||
                    (s.VARVALUE && s.VARVALUE.toLowerCase().includes(sv)) ||
                    (s.VARDescription && s.VARDescription.toLowerCase().includes(sv))
                )
            }

            if (params.jobVars) {
                result.jobVars = idm.jobVars.filter(s =>
                    (s.VARNAME && s.VARNAME.toLowerCase().includes(sv)) ||
                    (s.VARVALUE && s.VARVALUE.toLowerCase().includes(sv)) ||
                    (s.VarDescription && s.VarDescription.toLowerCase().includes(sv))
                )
            }

            if (params.repoVars) {
                result.repoVars = idm.repoVars.filter(s =>
                    (s.VarName && s.VarName.toLowerCase().includes(sv)) ||
                    (s.VarValue && s.VarValue.toLowerCase().includes(sv)) ||
                    (s.VarDescription && s.VarDescription.toLowerCase().includes(sv))
                )
            }

            if (params.globalScripts) {
                result.globalScripts = idm.globalScripts.filter(s =>
                    (s.ScriptName && s.ScriptName.toLowerCase().includes(sv)) ||
                    (s.ScriptDefinition && s.ScriptDefinition.toLowerCase().includes(sv))
                )

                for (let gs of result.globalScripts) {
                    gs.condensed = condense(gs.ScriptDefinition, sv)
                }
            }

            if (params.jobs) {
                result.jobs = idm.jobs.filter(j =>
                    (j.Name && j.Name.toLowerCase().includes(sv)) ||
                    (j.Description && j.Description.toLowerCase().includes(sv)) ||
                    (j.JobDefinition && j.JobDefinition.toLowerCase().includes(sv))
                )

                for (let job of result.jobs) {
                    job.condensed = condense(job.JobDefinition, sv)
                }
            }
        }
        else {
            // preload buffer in background
            (async () => {
                try {
                    await idm.updateSystemConfig()
                }
                catch (err) {
                    logger.error(err)
                }
            })()
        }

        return result
    }
}
