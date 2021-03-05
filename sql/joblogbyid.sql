-- $$jobId$$ /^[0-9]+$/
-- $$fromId$$ /^[0-9]+$/
-- $$top$$ /^[0-9]+$/

SELECT TOP $$top$$
LOG_ID,
JOB_ID,
NAME,
LOGDATE,
TIME_USED,
TOTAL,
ADDS,
MODS,
NOOP,
DELS,
WARNS,
ERRS,
DISPATCHER,
DESCRIPTION,
REPOSITORYNAME
FROM mcmv_joblog WITH(nolock)
WHERE JOB_ID = $$jobId$$
AND LOG_ID > $$fromId$$
ORDER BY LOG_ID DESC
