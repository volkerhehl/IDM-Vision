-- $$id$$ /^[0-9]+$/

SELECT t1.*, t2.NAME AS 'rule' FROM mc_jobs AS t1 WITH (NOLOCK)
LEFT JOIN mcv_schedrules AS t2 WITH (NOLOCK) ON t1.Schedule_Rule = t2.RULENO
WHERE t1.JobId = $$id$$
