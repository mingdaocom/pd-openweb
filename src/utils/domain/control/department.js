/**
 * 根据部门控件配置生成展示数据，并聚合已删除部门。
 */
export function formatDepartmentDisplayValue(value, advancedSetting = {}) {
  const { showdelete, allpath } = advancedSetting;
  const departments = Array.isArray(value) ? value : safeParse(value || '[]');
  let deleteCount = 0;
  const result = [];

  departments.forEach(item => {
    if (item.isDelete) {
      deleteCount += 1;
      return;
    }

    const pathValue = (
      allpath === '1'
        ? [...(item.departmentPath || [])].sort((a, b) => b.depth - a.depth).map(path => path.departmentName)
        : []
    ).concat([item.departmentName]);

    result.push({
      ...item,
      departmentName: pathValue.join('  /  '),
    });
  });

  if (showdelete === '1' && deleteCount) {
    result.push({
      departmentId: '',
      departmentName: _l('已删除'),
      isDelete: true,
      deleteCount,
    });
  }

  return result;
}
