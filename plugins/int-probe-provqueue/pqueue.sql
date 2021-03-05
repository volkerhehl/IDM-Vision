SELECT state, COUNT(State) AS count
FROM mxp_provision WITH(nolock)
GROUP BY State
ORDER BY State
