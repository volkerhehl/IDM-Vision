-- $$mskey$$ /^[0-9]+$/

SELECT TOP 1000
t2.mcMSKEYVALUE AS ApproverMSKV,
t2.mcDisplayName AS ApproverDN,
t1.APPROVER,
t1.TASKID,
t5.TaskName,
t1.ApproveTime,
t1.STATUS,
t1.REASON
FROM mxpv_old_approval AS t1 WITH(nolock)
LEFT JOIN idmv_entry_simple AS t2 WITH(nolock)
    ON t1.APPROVER = t2.mcMSKEY
LEFT JOIN MXP_Tasks AS t5 WITH(nolock) ON t1.TASKID = t5.taskID
WHERE t1.MSKEY = $$mskey$$
