'use strict'

// iteration limiter
const MAX_RECURSIONS = 30


module.exports = {
    topic: 'Search Job/Task',
    uiPosition: 300,

    call: async function({ idm, query, params, logger, polling }) {
        if (polling) {
            return await idm.getJobLog({ jobId: params.jobId, fromId: params.from, max: 250 })
        }

        if (!params.searchId && !params.searchName) {
            return
        }

        const V8 = idm.mvn > 7
        const v8add = V8 ? '-v8' : ''
        const groups = await query('groups' + v8add)
        const tasks = await query('tasks' + v8add)
        const jobs = await query('jobs' + v8add)
        const v8packages = V8 ? await query('packages') : null
        let jobList
        let taskList

        let returnData = {
            searchResult: Boolean(params.searchId || params.searchName)
        }

        if (params.searchId) {
            const id = params.searchId
            jobList = await query('job-by-id', { id: id })
            taskList = await query('task-by-id', { id: id })
        }
        else {
            const likePattern = params.searchName
                .split('%').join('[%]')
                .split('*').join('%')

            jobList = await query('job-by-name', { likePattern: likePattern })
            taskList = await query('task-by-name', { likePattern: likePattern })
        }

        const job = jobList.length == 1 ? jobList[0] : null
        const task = taskList.length == 1 ? taskList[0] : null

        // build location path structure recursively
        function locate(type, id, structure, iteration) {
            structure = structure ? structure : []
            iteration = iteration ? iteration + 1 : 1

            if (iteration < MAX_RECURSIONS) {
                if (type == 'package') {
                    const v8package = v8packages.find(p => p.mcPackageID == id)

                    if (v8package) {
                        structure.push({ name: v8package.mcDisplayName })

                        if (v8package.mcGroup) {
                            structure = locate('group', v8package.mcGroup, structure, iteration)
                        }
                    }
                }
                else if (type == 'group') {
                    const group = groups.find(g => g.Group_Id == id)

                    if (group) {
                        structure.push({ name: group.Group_Name })

                        if (group.Parent_Group) {
                            structure = locate(type, group.Parent_Group, structure, iteration)
                        }
                        else if (v8packages && group.mcPackageID) {
                            structure = locate('package', group.mcPackageID, structure, iteration)
                        }
                    }
                }
                else if (type == 'job') {
                    const job = jobs.find(j => j.JobId == id)

                    if (job) {
                        structure.push({ name: job.Name })

                        if (job.Group_Id) {
                            structure = locate('group', job.Group_Id, structure, iteration)
                        }
                        else if (job.TaskID) {
                            structure = locate('task', job.TaskID, structure, iteration)
                        }
                        else if (v8packages && job.mcPackageID) {
                            structure = locate('package', job.mcPackageID, structure, iteration)
                        }
                    }
                }
                else if (type == 'task') {
                    const task = tasks.find(t => t.TaskID == id)

                    if (task) {
                        structure.push({ name: task.TaskName })

                        if (task.TaskGroup) {
                            structure = locate('group', task.TaskGroup, structure, iteration)
                        }
                        else if (task.TaskRef) {
                            structure = locate('task', task.TaskRef, structure, iteration)
                        }
                        else if (v8packages && task.mcPackageID) {
                            structure = locate('package', task.mcPackageID, structure, iteration)
                        }
                    }
                }
            }
            else {
                logger.warn(
                    'Structure recursion stopping at max. iteration %s (searching for group id %s)',
                    iteration,
                    groupId
                )
            }

            return iteration == 1 ? structure.reverse() : structure
        }

        const jobLocation = job ? locate('job', job.JobId) : null
        const taskLocation = task ? locate('task', task.TaskID) : null

        if (job) {
            returnData.job = {
                name:job.Name,
                id: job.JobId,
                rule: job.rule,
                location: jobLocation
            }
        }

        if (task) {
            returnData.task = {
                name:task.TaskName,
                id: task.TaskID,
                location: taskLocation
            }
        }

        if (jobList.length > 1) {
            returnData.jobList = jobList
        }

        if (taskList.length > 1) {
            returnData.taskList = taskList
        }

        // logger.debugJSON(returnData)

        return returnData
    }
}
