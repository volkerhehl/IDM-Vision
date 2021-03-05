SELECT t1.TaskID, t1.TaskName, t1.TaskGroup, t3.Group_Name, t2.TaskRef
FROM MXP_Tasks AS t1 WITH(nolock)
LEFT JOIN MXP_TASKLNK AS t2 WITH(nolock) ON t1.TaskID = t2.TaskLnk
LEFT JOIN mc_Group AS t3 WITH(nolock) ON t1.TaskGroup = t3.Group_Id
