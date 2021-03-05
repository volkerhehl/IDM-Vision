WITH active AS (
    SELECT DISTINCT t1.TaskID
    FROM MCMV_TaskQueLength AS t1 WITH(nolock)
    INNER JOIN mc_dispatcher AS t2 WITH(nolock)
    ON t1.mcmv_jobdispatcher = t2.DispatcherID
    --AND t2.STOP_DISPATCHER != 2
    AND DATEDIFF(second, t2.LAST_VISITED, GETDATE()) <= t2.RELOAD_FREQUENCY * 1.2
),

retries AS (
    SELECT
    ActionID AS taskID,
    COUNT(*) AS cnt,
    MAX(RetryCount) AS maxRetries,
    MIN(RetryCount) AS minRetries,
    ROUND(AVG(CAST(RetryCount AS Float)), 2) AS avgRetries
    FROM MXP_Provision WITH (NOLOCK)
    GROUP BY ActionID
)

SELECT DISTINCT
t1.TaskID,
t1.TaskName,
t1.Private,
t1.QueSize,
t1.last_executed,
t1.mcmv_jobactive,
t1.mcmv_jobstate,
t1.mcmv_jobscheduled,
t1.mcmv_jobid,
t1.mcmv_parentid,
CASE WHEN t2.TaskID IS NULL THEN
    CASE WHEN t1.mcmv_jobstate IS NULL THEN '' ELSE 'off' END
ELSE 'active' END AS DispatcheStatus,
t3.maxRetries,
t3.avgRetries
FROM MCMV_TaskQueLength AS t1 WITH(nolock)
LEFT JOIN active AS t2 ON t1.TaskID = t2.TaskID
LEFT JOIN retries AS t3 ON t1.TaskID = t3.taskID
ORDER BY t1.TaskID
