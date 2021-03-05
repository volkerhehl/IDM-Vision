-- $$mskey$$ /^[0-9]+$/

SELECT TOP 1000
TaskID,
TaskName,
TaskType,
StateName,
ExecTime,
RetryCount,
rep_name AS RepositoryID,
MSG,
AuditRef
FROM MXPV_PROVISION WITH(nolock)
LEFT JOIN mc_repository WITH(nolock) ON rep_id = repositoryid
WHERE MSKEY = $$mskey$$
ORDER BY ExecTime DESC