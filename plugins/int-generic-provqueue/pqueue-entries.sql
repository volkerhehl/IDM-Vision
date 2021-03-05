-- $$taskId$$ /^[0-9]+$/

SELECT TOP 1000
t2.mcMSKEYVALUE AS MSKEYVALUE,
t2.mcDisplayName AS DisplayName,
t3.TaskID,
t3.TaskName,
t4.Name AS StateName,
t5.Name AS PrevStateName,
t6.rep_name,
t1.*
FROM MXP_Provision AS t1 WITH (NOLOCK)
LEFT JOIN idmv_entry_simple AS t2 WITH (NOLOCK) ON t1.MSKey = t2.mcMSKEY
LEFT JOIN MXP_Tasks AS t3 WITH (NOLOCK) ON t1.ActionID = t3.TaskID
LEFT JOIN MXP_State AS t4 WITH (NOLOCK) ON t1.State = t4.StatID
LEFT JOIN MXP_State AS t5 WITH (NOLOCK) ON t1.PrevState = t5.StatID
LEFT JOIN MC_REPOSITORY AS t6 WITH (NOLOCK) ON t1.RepositoryID = t6.rep_id
WHERE t1.ActionID = $$taskId$$
