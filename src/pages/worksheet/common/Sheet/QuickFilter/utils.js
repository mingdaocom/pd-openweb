import { WIDGETS_TO_API_TYPE_ENUM } from 'pages/widgetConfig/config/widget';

export function formatFilterValues(controlType, values = []) {
  switch (controlType) {
    case WIDGETS_TO_API_TYPE_ENUM.USER_PICKER: // 人员
      return values.map(value => safeParse(value)).map(c => ({ accountId: c.id, fullname: c.name, avatar: c.avatar }));
    case WIDGETS_TO_API_TYPE_ENUM.ORG_ROLE: // 角色
      return values.map(value => safeParse(value)).map(c => ({ organizeId: c.id, organizeName: c.name }));
    case WIDGETS_TO_API_TYPE_ENUM.DEPARTMENT: // 部门
      return values.map(value => safeParse(value)).map(c => ({ departmentId: c.id, departmentName: c.name }));
    case WIDGETS_TO_API_TYPE_ENUM.AREA_PROVINCE: // 地区
    case WIDGETS_TO_API_TYPE_ENUM.AREA_CITY: // 地区
    case WIDGETS_TO_API_TYPE_ENUM.AREA_COUNTY: // 地区
      return values.map(value => safeParse(value)).map(c => ({ id: c.id, name: c.name }));
    case WIDGETS_TO_API_TYPE_ENUM.RELATE_SHEET: // 关联
    case WIDGETS_TO_API_TYPE_ENUM.CASCADER: // 级联
      return values.map(value => safeParse(value)).map(c => ({ rowid: c.id, name: c.name }));
    default:
      return values;
  }
}

export function formatFilterValuesToServer(controlType, values = []) {
  values = values.filter(_.identity);
  switch (controlType) {
    case WIDGETS_TO_API_TYPE_ENUM.USER_PICKER: // 人员
      return values.map(v => v.accountId);
    case WIDGETS_TO_API_TYPE_ENUM.ORG_ROLE: // 角色
      return values.map(v => v.organizeId);
    case WIDGETS_TO_API_TYPE_ENUM.DEPARTMENT: // 部门
      return values.map(v => v.departmentId);
    case WIDGETS_TO_API_TYPE_ENUM.AREA_PROVINCE: // 地区
    case WIDGETS_TO_API_TYPE_ENUM.AREA_CITY: // 地区
    case WIDGETS_TO_API_TYPE_ENUM.AREA_COUNTY: // 地区
      return values.map(v => v.id);
    case WIDGETS_TO_API_TYPE_ENUM.RELATE_SHEET: // 关联
    case WIDGETS_TO_API_TYPE_ENUM.CASCADER: // 级联
      return values.map(v => v.rowid);
    default:
      return values;
  }
}
