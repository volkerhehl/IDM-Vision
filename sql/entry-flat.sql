-- $$mskey$$ /^[0-9]+$/

SELECT *
FROM idmv_value_basic AS t1 WITH(nolock)
WHERE t1.MSKEY = $$mskey$$
ORDER BY t1.AttrName
