-- $$all$$ /^[01]$/

DECLARE @all INT = $$all$$;

SELECT
t3.Group_Name AS GroupName,
t1.JobId,
t1.Name AS JobName,
t1.Current_Machine AS dispatcher,
t1.State,
t1.Active,
t1.Status,
t1.StatusText,
t2.Name AS SchedRule,
t1.ScheduledTime,
t1.StartTime,
ElapsedMin = DATEDIFF(minute, t1.StartTime, GETDATE()),
t1.StopTime,
t1.JobCounter,
t1.NumErrors,
t1.NumTries,
t1.NumEntries,
t1.CurrentEntry
FROM mc_jobs AS t1 WITH (NOLOCK)
LEFT JOIN mc_sched_rule AS t2 WITH (NOLOCK) ON t1.Schedule_Rule = t2.RuleNo
LEFT JOIN mc_Group AS t3 WITH (NOLOCK) ON t1.Group_Id = t3.Group_Id
WHERE @all = 1
OR (
    @all = 0
    AND (
        t1.State NOT IN (0, 1)
        OR (
            Active != 0
            AND (
                Status NOT IN (0, -1)
                OR (
                    DATEDIFF(HOUR, t1.StartTime, GETDATE()) < 48
                    AND t1.NumErrors > 0
                )
            )
        )
    )
)
ORDER BY ABS(State) DESC, ABS(COALESCE(Status, 0)), JobId
