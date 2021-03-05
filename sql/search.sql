-- $$searchvalue$$ /.*/
-- $$maxrows$$ /[0-9]*/
-- $$idstore$$ /[0-9]*/

SELECT DISTINCT TOP $$maxrows$$
t1.MSKEY,
t2.aValue AS MX_ENTRYTYPE,
t3.aValue AS MSKEYVALUE,
t4.aValue AS DISPLAYNAME,
t5.mcCreated,
t5.mcLastModified
FROM idmv_value_basic AS t1 WITH(nolock)
JOIN idmv_value_basic AS t2 WITH(nolock) ON t1.MSKEY = t2.MSKEY AND t2.AttrName = 'MX_ENTRYTYPE'
JOIN idmv_value_basic AS t3 WITH(nolock) ON t1.MSKEY = t3.MSKEY AND t3.AttrName = 'MSKEYVALUE'
LEFT JOIN idmv_value_basic AS t4 WITH(nolock) ON t1.MSKEY = t4.MSKEY AND t4.AttrName = 'DISPLAYNAME'
LEFT JOIN idmv_entry_simple AS t5 WITH (NOLOCK) ON t1.MSKEY = t5.mcMSKEY
WHERE t1.SearchValue LIKE '$$searchvalue$$'
AND t1.IS_ID = $$idstore$$
ORDER BY 2
