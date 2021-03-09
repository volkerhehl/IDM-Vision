-- $$mskey$$ /^[0-9]+$/

SELECT
t1a.mcEntryType AS fromEntryType,
t1a.mcMSKEYVALUE AS fromMSKV,
t1a.mcMSKEY AS fromMSKEY,
t1a.mcDisplayName AS fromDN,
t2.mcMSKEYVALUE AS ChangedByMSKV,
t2.mcDisplayName AS ChangedByDN,
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
LEFT JOIN idmv_entry_simple AS t1a WITH (NOLOCK) ON t1a.mcMSKEY = t1.MSKEY
LEFT JOIN idmv_entry_simple AS t2 WITH(nolock)
    ON CASE
        WHEN ISNUMERIC(t1.ChangedBy) = 1 THEN TRY_CAST(t1.ChangedBy AS INT)
        ELSE NULL
    END = t2.mcMSKEY
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
WHERE ISNUMERIC(t1.aValue) = 1 AND TRY_CAST(t1.aValue AS INT) = $$mskey$$
ORDER BY t1.Modifytime DESC

