-- $$likePattern$$ /.*/

SELECT * FROM MXP_Tasks WITH(nolock)
WHERE TaskName LIKE '$$likePattern$$'
ORDER BY TaskName
