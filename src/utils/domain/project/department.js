/** 将部门接口数据转换为普通部门树节点。 */
export function formatDepartmentTree(data, parentId) {
  return data.map(item => {
    const { departmentId, departmentName, userCount, haveSubDepartment, subDepartments = [] } = item;

    return {
      departmentId,
      departmentName,
      userCount,
      haveSubDepartment,
      open: subDepartments.length > 0,
      subDepartments,
      parentId,
    };
  });
}

/** 递归转换搜索接口返回的部门树。 */
export function formatSearchDepartmentTree(data) {
  return data.map(item => {
    const { departmentId, departmentName, userCount, haveSubDepartment } = item;
    let { subDepartments = [] } = item;

    if (subDepartments.length) {
      subDepartments = formatSearchDepartmentTree(subDepartments);
    }

    return {
      departmentId,
      departmentName,
      userCount,
      haveSubDepartment,
      open: subDepartments && subDepartments.length,
      subDepartments,
    };
  });
}

/** 按 departmentId 深度优先查找部门树节点。 */
export function findDepartmentById(departmentTree = [], id) {
  for (const department of departmentTree) {
    if (department.departmentId === id) return department;

    const matchedDepartment = findDepartmentById(department.subDepartments || [], id);
    if (matchedDepartment) return matchedDepartment;
  }
}

/** 按 departmentId 查找节点，并按“当前节点到根节点”的顺序返回路径。 */
export function findDepartmentPathById(departmentTree = [], id) {
  for (const department of departmentTree) {
    if (String(department.departmentId) === String(id)) return [department];

    const path = findDepartmentPathById(department.subDepartments || [], id);
    if (path) return path.concat(department);
  }
}
