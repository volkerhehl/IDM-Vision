-- $$varname$$ /.*/

SELECT *
FROM [dbo].[MC_GLOBAL_VARIABLES] WITH(nolock)
WHERE VARNAME = '$$varname$$'
ORDER BY VarCategory DESC
