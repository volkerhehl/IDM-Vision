SELECT t1.Group_Id, t1.Group_Name, t1.Parent_Group, t4.mcPackageID, t4.mcDisplayName AS PackageName
FROM mc_Group AS t1 WITH(nolock)
LEFT JOIN mxpv_packages AS t4  WITH(nolock) ON t1.mcPackageID = t4.mcPackageID
