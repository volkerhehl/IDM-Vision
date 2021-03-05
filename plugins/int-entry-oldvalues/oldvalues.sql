-- $$mskey$$ /^[0-9]+$/

SELECT
t2.aValue AS ChangedByMSKV,
t3.aValue AS ValueMSKV,
t6.aValue AS ValueDisplayName,
t4.TaskId AS AuditTaskId,
t5.TaskName AS AuditTaskName,
t1.AttrName,
t1.Changename,
t1.AuditId,
t1.Modifytime,
t1.ChangedBy,
t1.UserID,
t1.aValue
FROM idmv_ovalue_basic_all AS t1 WITH(nolock)
LEFT JOIN idmv_value_basic AS t2 WITH(nolock)
    ON CASE
        WHEN ISNUMERIC(t1.ChangedBy) = 1 THEN TRY_CAST(t1.ChangedBy AS INT)
        ELSE NULL
    END = t2.MSKEY
    AND t2.AttrName = 'MSKEYVALUE'
LEFT JOIN idmv_value_basic AS t6 WITH(nolock)
    ON CASE
        WHEN ISNUMERIC(t1.aValue) = 1 THEN TRY_CAST(t1.aValue AS INT)
        ELSE NULL
    END = t6.MSKEY
    AND t6.AttrName = 'DISPLAYNAME'
LEFT JOIN idmv_value_basic AS t3 WITH(nolock)
    ON CASE
        WHEN ISNUMERIC(t1.aValue) = 1 THEN TRY_CAST(t1.aValue AS INT)
        ELSE NULL
    END = t3.MSKEY
    AND t3.AttrName = 'MSKEYVALUE'
LEFT JOIN MXP_AUDIT AS t4 WITH(nolock) ON t1.AuditId = t4.AuditID
LEFT JOIN MXP_Tasks AS t5 WITH(nolock) ON t4.TaskId = t5.taskID
WHERE t1.MSKEY = $$mskey$$
ORDER BY t1.Modifytime DESC
