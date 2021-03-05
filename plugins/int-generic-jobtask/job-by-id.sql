-- $$id$$ /^[0-9]+$/

SELECT * FROM mc_jobs WITH(nolock)
WHERE JobId = $$id$$
