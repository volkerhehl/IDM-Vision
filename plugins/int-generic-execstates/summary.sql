-- $$days$$ /^[\d]$/

DECLARE @days INT = $$days$$

SELECT mcExecState AS estate, cnt = COUNT(*)
FROM idmv_link_ext WITH (NOLOCK)
WHERE mcExecState > 3 AND mcExecState NOT IN (1024, 1025, 1026)
AND (
    @days = 0
    OR CONVERT(datetime, mcModifyTime, 126) > CONVERT(datetime, GETDATE() - @days, 126)
)
GROUP BY mcExecState
UNION
SELECT -9999 AS estate, cnt = COUNT(*)
FROM idmv_link_ext WITH (NOLOCK)
WHERE mcOrphan != 0
AND (
    @days = 0
    OR CONVERT(datetime, mcModifyTime, 126) > CONVERT(datetime, GETDATE() - @days, 126)
)
ORDER BY estate
