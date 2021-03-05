-- $$mskey$$ /^[0-9]+$/

SELECT TOP 1000
t2.TaskName,
t3.Name AS ProvStatusName,
t4.rep_name,
t1.*
FROM MXP_AUDIT AS t1 WITH(nolock)
LEFT JOIN MXP_Tasks AS t2 WITH(nolock) ON t1.TaskId = t2.TaskID
LEFT JOIN mxp_provstatus AS t3 WITH(nolock) ON t1.ProvStatus = t3.ProvStatus
LEFT JOIN MC_REPOSITORY AS t4 WITH(nolock) ON t1.repository = t4.rep_id
WHERE t1.MSKey = $$mskey$$
ORDER BY t1.PostedDate DESC
