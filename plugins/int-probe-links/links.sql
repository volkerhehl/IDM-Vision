SELECT COUNT(*) AS failed_count
FROM idmv_link_ext2 WITH(nolock)
WHERE mcExecState = 4
