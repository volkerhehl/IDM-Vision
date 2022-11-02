-- $$days$$ /^[\d]$/

DECLARE @days INT = $$days$$

SELECT
failed = (
    SELECT COUNT (*) FROM idmv_link_ext WITH (NOLOCK)
    WHERE (@days = 0 OR CONVERT(datetime, mcModifyTime, 126) > CONVERT(datetime, GETDATE() - @days, 126))
    AND mcExecState IN (4, 5, 6, 7, 1028, 1029, 1030, 1031)
),
penadd = (
    SELECT COUNT (*) FROM idmv_link_ext WITH (NOLOCK)
    WHERE (@days = 0 OR CONVERT(datetime, mcModifyTime, 126) > CONVERT(datetime, GETDATE() - @days, 126))
    AND mcExecState >= 512 AND mcExecState <= 519
),
pendel = (
    SELECT COUNT (*) FROM idmv_link_ext WITH (NOLOCK)
    WHERE (@days = 0 OR CONVERT(datetime, mcModifyTime, 126) > CONVERT(datetime, GETDATE() - @days, 126))
    AND mcExecState >= 1536 AND mcExecState <= 1543
),
partok = (
    SELECT COUNT (*) FROM idmv_link_ext WITH (NOLOCK)
    WHERE (@days = 0 OR CONVERT(datetime, mcModifyTime, 126) > CONVERT(datetime, GETDATE() - @days, 126))
    AND mcExecState IN (3, 1027)
)
