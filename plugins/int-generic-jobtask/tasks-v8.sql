SELECT t1.TaskID, t1.TaskName, t1.TaskGroup, t3.Group_Name, t2.TaskRef, t4.mcPackageID, t4.mcDisplayName AS PackageName
FROM MXP_Tasks AS t1 WITH(nolock)
LEFT JOIN MXP_TASKLNK AS t2 WITH(nolock) ON t1.TaskID = t2.TaskLnk
LEFT JOIN mc_Group AS t3 WITH(nolock) ON t1.TaskGroup = t3.Group_Id
LEFT JOIN mxpv_packages AS t4  WITH(nolock) ON t1.mcPackageID = t4.mcPackageID
