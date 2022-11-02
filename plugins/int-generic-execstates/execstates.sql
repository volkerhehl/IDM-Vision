-- $$days$$ /^[\d]$/

DECLARE @days INT = $$days$$;

WITH links AS (
    SELECT *
    FROM idmv_link_ext WITH (NOLOCK)
    WHERE (
        mcExecState > 2
        OR mcOrphan != 0
    )
    AND (
        @days = 0
        OR CONVERT(datetime, mcModifyTime, 126) > CONVERT(datetime, GETDATE() - @days, 126)
    )
)

SELECT
type = t1.mcEntryType,
msk = t1.mcMSKEY,
mskv = t1.mcMSKEYVALUE,
dn = t1.mcDisplayName,
failed = (SELECT COUNT(*) FROM links AS t0 WHERE t0.mcThisMSKEY = t1.mcMSKEY AND t0.mcExecState IN (4, 5, 6, 7, 1028, 1029, 1030, 1031)),
penadd = (SELECT COUNT(*) FROM links AS t0 WHERE t0.mcThisMSKEY = t1.mcMSKEY AND t0.mcExecState >= 512 AND t0.mcExecState <= 519),
pendel = (SELECT COUNT(*) FROM links AS t0 WHERE t0.mcThisMSKEY = t1.mcMSKEY AND t0.mcExecState >= 1536 AND t0.mcExecState <= 1543),
partok = (SELECT COUNT(*) FROM links AS t0 WHERE t0.mcThisMSKEY = t1.mcMSKEY AND t0.mcExecState IN (3, 1027)),
orphan = (SELECT COUNT(*) FROM links AS t0 WHERE t0.mcThisMSKEY = t1.mcMSKEY AND t0.mcOrphan != 0)
FROM idmv_entry_simple AS t1 WITH (NOLOCK)
WHERE (SELECT COUNT(*) FROM links AS t0 WHERE t0.mcThisMSKEY = t1.mcMSKEY) > 0
ORDER BY type, mskv
