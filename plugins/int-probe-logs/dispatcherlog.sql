SELECT * FROM (VALUES (
    (SELECT COUNT(*) FROM dbo.mc_dispatcher_log WITH(nolock)
        WHERE mcSeverity = 3 AND DATEDIFF(SECOND, mcDateTime, GETDATE()) < 600),
    (SELECT COUNT(*) FROM dbo.mc_dispatcher_log WITH(nolock)
        WHERE mcSeverity = 3 AND DATEDIFF(SECOND, mcDateTime, GETDATE()) < 86400)
)) AS MyTable(fatal_err_10m, fatal_err_24h)
