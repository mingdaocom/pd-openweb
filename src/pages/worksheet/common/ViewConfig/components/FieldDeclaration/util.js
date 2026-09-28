import { VIEW_CONFIG_EXCLUDED_CONTROL_TYPES_WITH_SECTION } from '../../config';
import { sortControls } from '../../util';

// 仅保留插件列表返回值可声明的业务字段；系统字段、隐藏字段和前端不适合列表返回的控件类型不进入配置列表。
export const getReturnFieldColumns = (columns = [], hiddenControlIds = []) => {
  return sortControls(
    columns
      .filter(column => !hiddenControlIds.includes(column.controlId))
      .filter(
        column =>
          column.controlName &&
          (column.controlId || '').length > 20 &&
          !VIEW_CONFIG_EXCLUDED_CONTROL_TYPES_WITH_SECTION.includes(column.type),
      ),
  );
};

// 默认模式与列表视图显示列保持同一策略：按表单顺序取前 50 个可声明字段。
export const getDefaultReturnControlIds = (columns = [], hiddenControlIds = []) => {
  return getReturnFieldColumns(columns, hiddenControlIds)
    .slice(0, 50)
    .map(column => column.controlId);
};
