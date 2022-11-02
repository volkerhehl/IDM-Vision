SELECT
runtime_max = (SELECT TOP 1 DATEDIFF(SECOND, StartTime, GETDATE()) FROM mc_jobs WITH (nolock) WHERE State=2 AND Name NOT LIKE 'Monitoring%' AND StartTime IS NOT NULL ORDER BY StartTime),
active_count = (SELECT COUNT(*) FROM mc_jobs WITH (nolock) WHERE State=2 AND Name NOT LIKE 'Monitoring%'),
bad_state_count = (SELECT COUNT(*) FROM mc_jobs WITH(nolock) WHERE Active = 1 AND State NOT IN (1, 2, 0))
