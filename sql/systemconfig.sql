SELECT * FROM MC_GLOBAL_VARIABLES WITH(nolock)

SELECT t1.*, t2.Name
    FROM MC_JOB_VARIABLES AS t1 WITH(nolock)
    JOIN mc_jobs AS t2 WITH(nolock) ON t1.JobId = t2.JobId

SELECT *
    FROM MC_REPOSITORY_VARS AS t1 WITH(nolock)
    LEFT JOIN MC_REPOSITORY AS t2 WITH(nolock) ON t1.Repository = t2.rep_id

SELECT * FROM mc_global_scripts WITH(nolock)

SELECT * FROM mc_jobs WITH(nolock)
