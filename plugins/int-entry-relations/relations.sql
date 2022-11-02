-- $$mskey$$ /^[0-9]+$/
-- $$logon_alias_attr$$ /^\w+$/
-- $$sam_account_attr$$ /^\w+$/

DECLARE @mskey INT;
DECLARE @logon_alias_attr NVARCHAR(255);
DECLARE @sam_account_attr NVARCHAR(255);

SET @mskey = $$mskey$$;
SET @logon_alias_attr = '$$logon_alias_attr$$';
SET @sam_account_attr = '$$sam_account_attr$$';

(
    SELECT
    'from' AS direction,
    t1.mcUniqueID,
    t1.mcAttrName AS AttrName,
    t1.mcOtherMSKEY AS MSKEY,
    t1.mcOtherOcName AS entrytype,
    t1.mcOtherMSKEYVALUE AS MSKEYVALUE,
    t3.aValue AS DISPLAYNAME,
    t4.aValue AS LOGONALIAS,
    t7.aValue AS AD_OBJECT,
    t5.aValue AS MX_FIRSTNAME,
    t6.aValue AS MX_LASTNAME,
    t1.mcAssignedDirect,
    t1.mcAssignedDynamicGroup,
    t1.mcAssignedInheritCount,
    t1.mcOrphan,
    t1.mcValidFrom,
    t1.mcValidTo,
    t1.mcContextMSKEY,
    t2.aValue AS CTX,
    t1.mcModifyTime,
    t1.mcProcessInfo,
    t1.mcReason,
    t1.mcLinkState,
    t1.mcExecState,
    t1.mcExecStateHierarchy
    FROM idmv_link_ext AS t1 WITH(nolock)
    LEFT JOIN idmv_value_basic AS t2 WITH(nolock)
    ON t1.mcContextMSKEY = t2.MSKEY AND t2.AttrName = 'MSKEYVALUE'
    LEFT JOIN idmv_value_basic AS t3 WITH(nolock)
    ON t1.mcOtherMSKEY = t3.MSKEY AND t3.AttrName = 'DISPLAYNAME'
    LEFT JOIN idmv_value_basic AS t4 WITH(nolock)
    ON t1.mcOtherMSKEY = t4.MSKEY AND t4.AttrName = @logon_alias_attr
    LEFT JOIN idmv_value_basic AS t5 WITH(nolock)
    ON t1.mcOtherMSKEY = t5.MSKEY AND t5.AttrName = 'MX_FIRSTNAME'
    LEFT JOIN idmv_value_basic AS t6 WITH(nolock)
    ON t1.mcOtherMSKEY = t6.MSKEY AND t6.AttrName = 'MX_LASTNAME'
    LEFT JOIN idmv_value_basic AS t7 WITH(nolock)
    ON t1.mcOtherMSKEY = t7.MSKEY AND t7.AttrName = @sam_account_attr
    WHERE mcThisMSKEY = @mskey
)
UNION
(
    SELECT
    'to' AS direction,
    t1.mcUniqueID,
    t1.mcAttrName AS AttrName,
    t1.mcThisMSKEY AS MSKEY,
    t1.mcThisOcName AS entrytype,
    t1.mcThisMSKEYVALUE AS MSKEYVALUE,
    t3.aValue AS DISPLAYNAME,
    t4.aValue AS LOGONALIAS,
    t7.aValue AS AD_OBJECT,
    t5.aValue AS MX_FIRSTNAME,
    t6.aValue AS MX_LASTNAME,
    t1.mcAssignedDirect,
    t1.mcAssignedDynamicGroup,
    t1.mcAssignedInheritCount,
    t1.mcOrphan,
    t1.mcValidFrom,
    t1.mcValidTo,
    t1.mcContextMSKEY,
    t2.aValue AS CTX,
    t1.mcModifyTime,
    t1.mcProcessInfo,
    t1.mcReason,
    t1.mcLinkState,
    t1.mcExecState,
    t1.mcExecStateHierarchy
    FROM idmv_link_ext AS t1 WITH(nolock)
    LEFT JOIN idmv_value_basic AS t2 WITH(nolock)
    ON t1.mcContextMSKEY = t2.MSKEY AND t2.AttrName = 'MSKEYVALUE'
    LEFT JOIN idmv_value_basic AS t3 WITH(nolock)
    ON t1.mcThisMSKEY = t3.MSKEY AND t3.AttrName = 'DISPLAYNAME'
    LEFT JOIN idmv_value_basic AS t4 WITH(nolock)
    ON t1.mcThisMSKEY = t4.MSKEY AND t4.AttrName = @logon_alias_attr
    LEFT JOIN idmv_value_basic AS t5 WITH(nolock)
    ON t1.mcThisMSKEY = t5.MSKEY AND t5.AttrName = 'MX_FIRSTNAME'
    LEFT JOIN idmv_value_basic AS t6 WITH(nolock)
    ON t1.mcThisMSKEY = t6.MSKEY AND t6.AttrName = 'MX_LASTNAME'
    LEFT JOIN idmv_value_basic AS t7 WITH(nolock)
    ON t1.mcThisMSKEY = t7.MSKEY AND t7.AttrName = @sam_account_attr
    WHERE mcOtherMSKEY = @mskey
    AND LEFT(mcThisMSKEYVALUE, 3) != 'RQ:'
)
UNION
(
    SELECT
    'to' AS direction,
    t1.mcUniqueID,
    t1.mcAttrName AS AttrName,
    t1.mcThisMSKEY AS MSKEY,
    t1.mcThisOcName AS entrytype,
    t1.mcThisMSKEYVALUE AS MSKEYVALUE,
    t3.aValue AS DISPLAYNAME,
    t4.aValue AS LOGONALIAS,
    t7.aValue AS AD_OBJECT,
    t5.aValue AS MX_FIRSTNAME,
    t6.aValue AS MX_LASTNAME,
    t1.mcAssignedDirect,
    t1.mcAssignedDynamicGroup,
    t1.mcAssignedInheritCount,
    t1.mcOrphan,
    t1.mcValidFrom,
    t1.mcValidTo,
    t1.mcContextMSKEY,
    t2.aValue AS CTX,
    t1.mcModifyTime,
    t1.mcProcessInfo,
    t1.mcReason,
    t1.mcLinkState,
    t1.mcExecState,
    t1.mcExecStateHierarchy
    FROM idmv_link_ext AS t1 WITH(nolock)
    LEFT JOIN idmv_value_basic AS t2 WITH(nolock)
    ON t1.mcContextMSKEY = t2.MSKEY AND t2.AttrName = 'MSKEYVALUE'
    LEFT JOIN idmv_value_basic AS t3 WITH(nolock)
    ON t1.mcThisMSKEY = t3.MSKEY AND t3.AttrName = 'DISPLAYNAME'
    LEFT JOIN idmv_value_basic AS t4 WITH(nolock)
    ON t1.mcThisMSKEY = t4.MSKEY AND t4.AttrName = @logon_alias_attr
    LEFT JOIN idmv_value_basic AS t5 WITH(nolock)
    ON t1.mcThisMSKEY = t5.MSKEY AND t5.AttrName = 'MX_FIRSTNAME'
    LEFT JOIN idmv_value_basic AS t6 WITH(nolock)
    ON t1.mcThisMSKEY = t6.MSKEY AND t6.AttrName = 'MX_LASTNAME'
    LEFT JOIN idmv_value_basic AS t7 WITH(nolock)
    ON t1.mcThisMSKEY = t7.MSKEY AND t7.AttrName = @sam_account_attr
    WHERE mcUniqueID IN (
        SELECT TOP 3000 mcUniqueID
        FROM idmv_link_ext
        WHERE mcOtherMSKEY = @mskey
        AND LEFT(mcThisMSKEYVALUE, 3) = 'RQ:'
        ORDER BY mcModifyTime DESC
    )
)
ORDER BY AttrName
