-- $$likePattern$$ /.*/

SELECT * FROM mc_jobs WITH(nolock)
WHERE Name LIKE '$$likePattern$$'
ORDER BY Name
