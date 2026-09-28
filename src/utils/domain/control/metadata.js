import { includes } from 'lodash';
import _ from 'lodash';
import { NOT_AS_TITLE_CONTROL } from './config';
import { RELATION_OPTIONS } from './setting';
import { DEFAULT_CONFIG } from './widget';
import { enumWidgetType } from './widgetTypes';

/** 判断字段类型能否设置为记录标题。 */
export const canSetAsTitle = data => {
  let { type } = data;

  if (type === 30) {
    if (data.sourceControl && data.sourceControl.type && (data.strDefault || '')[0] !== '1') {
      type = data.sourceControl.type;
    } else {
      return false;
    }
  }

  return !includes(NOT_AS_TITLE_CONTROL, type);
};

/** 获取字段类型对应的名称、图标和默认配置。 */
export const getWidgetInfo = type => {
  if (typeof type === 'number') {
    type = enumWidgetType[type];
  }

  return DEFAULT_CONFIG[type] || {};
};

/** 获取字段类型对应的图标名称。 */
export const getIconByType = type => {
  const { icon } = getWidgetInfo(type);
  return icon;
};

/** 获取自由连接类型对应的显示文案。 */
export const getRelationText = enumDefault => {
  return (
    _.get(
      _.find(RELATION_OPTIONS, i => i.value === enumDefault && enumDefault),
      'text',
    ) || _l('自由连接')
  );
};

/** 将等级值安全转换为有效数字。 */
export const levelSafeParse = value => {
  let levelValue = parseFloat(value, 10);

  if (!_.isNumber(levelValue) || _.isNaN(levelValue)) {
    levelValue = undefined;
  }

  return levelValue;
};

/** 判断汇总结果是否支持单位和小数配置。 */
export const isShowUnitConfig = (data = {}, selectedControl = {}) => {
  const { enumDefault, enumDefault2 } = data;
  // 如果是日期格式汇总 不显示
  if ([2, 3].includes(enumDefault) && [15, 16, 46].includes(enumDefault2)) return false;
  // 选择日期汇总字段
  if (selectedControl.type === 37) {
    if ([2, 3].includes(enumDefault) && [15, 16, 46].includes(selectedControl.enumDefault2)) return false;
  }

  return true;
};

// 关联多条列表显示的控件

/** 判断字段是否为自定义字段或自定义形态字段。 */
export const isCustomWidget = data => {
  return data.type === 54 || (_.get(data, 'advancedSetting.customtype') === '1' && data.type !== 30);
};

// 校验某些控件上限
/** 检查自定义字段和富文本字段是否达到数量上限。 */
export const checkWidgetMaxNumErr = (data, allControls = []) => {
  // 自定义控件超出提示
  if (isCustomWidget(data) && allControls.filter(isCustomWidget).length >= 5) {
    return _l('超过自定义字段数量限制');
  }

  // 富文本超出提示
  if (data.type === 41 && allControls.filter(i => i.type === 41).length >= 5) {
    return _l('富文本字段数量已达上限（5个）');
  }
};

/** 从字段数据源表达式中提取真实字段标识。 */
export const parseDataSource = dataSource => {
  if (!_.isString(dataSource) || !dataSource) return '';
  if (includes(dataSource, '$')) return dataSource.slice(1, -1);
  return dataSource;
};

// 表单保存选项集不校验
