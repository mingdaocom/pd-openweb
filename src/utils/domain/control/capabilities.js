import _, { get, includes } from 'lodash';
import { browserIsMobile } from 'src/utils/platform/browser/device';
import { getSubListSheetMode } from 'src/utils/platform/runtime/config';
import {
  HAVE_HIGH_SETTING_WIDGET,
  HAVE_MASK_WIDGET,
  HAVE_MOBILE_WIDGET,
  HAVE_OPTION_WIDGET,
  HAVE_TABLE_STYLE_WIDGET,
  NO_DES_WIDGET,
} from './config';
import { fixedBottomWidgets } from './editorLayout';
import { getControlByControlId } from './filters';
import { isCustomWidget, isShowUnitConfig, parseDataSource } from './metadata';
import { isSheetDisplay } from './style';

const UN_TEXT_WIDGET_TYPES = new Set([
  9, 10, 11, 14, 15, 16, 19, 23, 24, 26, 27, 28, 29, 34, 35, 36, 40, 42, 45, 46, 47, 48, 50, 200,
]);

/** 判断控件是否按非文本交互处理。 */
export const isUnTextWidget = (data = {}) => {
  if (isCustomWidget(data) || UN_TEXT_WIDGET_TYPES.has(data.type)) return true;
  if (data.type === 6 && _.includes(['2', '3'], _.get(data, 'advancedSetting.showtype'))) return true;
  if (data.type === 2 && browserIsMobile() && (data.strDefault || '10').split('')[1] === '1') return true;
  return false;
};

/** 判断控件在当前设备上是否支持标题与内容左右布局。 */
export const supportDisplayRow = item => {
  // 附件、单条关联记录、多条关联记录（卡片）、子表、分割线、备注、分段
  if (browserIsMobile()) {
    return (
      !includes([14, 29, 34, 22, 51, 52], item.type) ||
      ((item.type === 29 || item.type === 51) && _.get(item, 'advancedSetting.showtype') === '3')
    );
  }

  // 多条关联记录（列表）、查询记录列表、子表、分割线、备注
  return !(isSheetDisplay(item) || includes([34, 22, 51, 52], item.type));
};

// 关联记录、关联查询须过滤的字段

/** 判断控件是否不能放入分段标签页。 */
export const notInsetSectionTab = (data = {}) => {
  return (
    (includes([29, 51], data.type) && _.includes(['2', '6'], get(data, 'advancedSetting.showtype'))) || data.type === 52
  );
};

// 不支持字段说明----显示方式的控件
/** 判断控件当前显示形态是否不支持字段说明布局。 */
export const notExplainDisplay = (data = {}) => {
  return (
    (includes([29, 51], data.type) && _.includes(['2', '5', '6'], get(data, 'advancedSetting.showtype'))) ||
    _.includes([22, 52], data.type)
  );
};

/** 判断控件是否不支持字段描述。 */
export const notWidgetDes = (data = {}) => {
  return fixedBottomWidgets(data) || _.includes(NO_DES_WIDGET, data.type);
};

// 需要固定在底部的控件

// 获取标签页等控件与普通控件的分界位置

/** 按忽略大小写的安全正则匹配控件搜索文本。 */
export function SearchFn(keywords = '', value = '') {
  return value.search(new RegExp(keywords.trim().replace(/([,.+?:()*[\]^$|{}\\-])/g, '\\$1'), 'i')) !== -1;
}

// 汇总是否显示单位及小数点配置

/** 判断字段设置面板是否应显示指定配置分组。 */
export const supportSettingCollapse = (props, key) => {
  const { data = {}, allControls = [], isRecycle, from } = props;
  const {
    dataSource,
    sourceControlId,
    type,
    advancedSetting = {},
    strDefault = '',
    enumDefault,
    enumDefault2,
    globalSheetInfo = {},
    controlId,
  } = data;

  // 回收站只显示基础设置
  if (isRecycle) {
    return _.includes(['base'], key);
  }

  const isCustom = isCustomWidget(data);
  const mode = getSubListSheetMode(controlId);

  switch (key) {
    case 'base':
      return true;
    case 'option':
      if (type === 51) {
        return advancedSetting.querytype !== '1';
      }

      return _.includes(HAVE_OPTION_WIDGET, type) || (type === 45 && enumDefault === 3);
    case 'style':
      return _.includes(HAVE_TABLE_STYLE_WIDGET, type) || isSheetDisplay(data);
    case 'highsetting':
      switch (type) {
        case 9:
        case 11:
          if (isCustom) return false;
          return dataSource ? advancedSetting.showtype !== '2' : true;
        case 26:
          return from !== 'subList' || advancedSetting.checkusertype !== '1';
        case 30:
          return strDefault.split('')[0] === '0';
        case 34:
          return mode === 'relate' ? true : !advancedSetting.layercontrolid;
        case 37:
          const parsedDataSource = parseDataSource(dataSource);
          const { relationControls = [] } = getControlByControlId(allControls, parsedDataSource);
          const selectedControl = getControlByControlId(relationControls, sourceControlId);
          return isShowUnitConfig(data, selectedControl);
        case 51:
          return enumDefault === 2 && advancedSetting.querytype !== '1';
        case 53:
          return _.includes([2, 6], enumDefault2);
        default:
          if (_.includes([2, 6, 46, 10], type) && isCustom) return false;
          return _.includes(HAVE_HIGH_SETTING_WIDGET, type);
      }

    case 'security':
      let currentControl = { ...data };

      if (currentControl.type === 30) {
        const parsedDataSource = parseDataSource(dataSource);
        const { relationControls = [] } = getControlByControlId(allControls, parsedDataSource);
        const parsedControl = getControlByControlId(relationControls, sourceControlId);
        currentControl = parsedControl;
      }

      if (_.includes([2, 6], currentControl.type) && isCustomWidget(currentControl)) return false;

      return (
        HAVE_MASK_WIDGET.includes(currentControl.type) ||
        (currentControl.type === 2 && currentControl.enumDefault === 2) ||
        (currentControl.type === 6 && currentControl.advancedSetting.showtype !== '2')
      );
    case 'relate':
      return from !== 'subList' && globalSheetInfo.worksheetId !== dataSource && _.includes([29, 35], type);
    case 'permission':
      return true;
    case 'mobile':
      if (_.includes([2, 29], type) && isCustom) return false;
      return (
        (_.includes(HAVE_MOBILE_WIDGET, type) ||
          (type === 14 && !_.includes(['2', '3'], _.get(safeParse(advancedSetting.filetype || '{}'), 'type')))) &&
        from !== 'subList'
      );
  }
};

// 各控件分别支持哪些配置
// 设置、样式、说明、事件
/** 判断字段是否支持指定样式、说明或事件配置。 */
export const supportWidgetIntroOptions = (data = {}, introType, from, isRecycle = false) => {
  // 回收站不显示样式、说明
  if (isRecycle) return false;
  // 分段、他表、标签页
  if (_.includes([22, 30], data.type) && introType === 2) return false;
  // 子表内不支持事件
  if (from === 'subList' && introType === 4) return false;

  return true;
};

// 过滤系统字段专用
