-- $$mskey$$ /^[0-9]+$/

(
    SELECT TOP 1000 Auditflag_ID, semaphorename, updtime, mcmv_task_audit, history = 0
    FROM mcmv_semstatus WITH(nolock)
    WHERE mskey = $$mskey$$
)
UNION
(
    SELECT TOP 1000 Auditflag_ID, semaphorename, updtime, mcmv_task_audit = NULL, history = 1
    FROM mxpv_flaghistory WITH(nolock)
    WHERE mskey = $$mskey$$
)
ORDER BY history, updtime DESC
