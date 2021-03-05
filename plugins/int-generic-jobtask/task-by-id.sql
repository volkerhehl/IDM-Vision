-- $$id$$ /^[0-9]+$/

SELECT * FROM MXP_Tasks WITH(nolock)
WHERE TaskID = $$id$$
