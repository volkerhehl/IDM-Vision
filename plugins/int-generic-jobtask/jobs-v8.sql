SELECT t1.JobId, t1.Name, t1.Group_Id, t3.Group_Name, t2.TaskID, t2.TaskName, t4.mcPackageID, t4.mcDisplayName AS PackageName
FROM mc_jobs AS t1 WITH(nolock)
LEFT JOIN mxpv_job_tasklink AS t2 WITH(nolock) ON t1.JobId = t2.JOBID
LEFT JOIN mc_Group AS t3  WITH(nolock) ON t1.Group_Id = t3.Group_Id
LEFT JOIN mxpv_packages AS t4  WITH(nolock) ON t1.mcPackageID = t4.mcPackageID
WHERE t1.mcObsoletedTime IS NULL
