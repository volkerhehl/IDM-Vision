-- $$priv_stringlist$$ /.*/
-- $$userAttr$$ /.*/
-- $$userNameAttr$$ /.*/

SELECT
t1.mcThisMSKEY AS mskey,
LOWER(t3.aValue) AS usr,
t2.aValue AS name,
t1.mcOtherMSKEYVALUE AS entry
FROM idmv_link_ext AS t1 WITH(nolock)
JOIN idmv_value_basic AS t2 WITH(nolock)
    ON t1.mcThisMSKEY = t2.MSKEY
    AND t2.AttrName = '$$userNameAttr$$'
JOIN idmv_value_basic AS t3 WITH(nolock)
    ON t1.mcThisMSKEY = t3.MSKEY
    AND t3.AttrName = '$$userAttr$$'
WHERE t1.mcThisOcName = 'MX_PERSON'
AND t1.mcOtherMSKEYVALUE IN ($$priv_stringlist$$)
