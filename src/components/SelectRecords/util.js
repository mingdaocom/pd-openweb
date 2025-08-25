import _, { find, get, isNumber } from 'lodash';
import { WIDGETS_TO_API_TYPE_ENUM } from 'src/pages/widgetConfig/config/widget';
import { turnControl } from 'src/pages/worksheet/common/Sheet/QuickFilter/Conditions';
import { ERROR_MESSAGE } from './useRecords';

export function enrichFilters(filters) {
  return filters.map(f => ({
    ...f,
    advancedSetting: { direction: '2', allowitem: '1' },
  }));
}

export function formatSearchFilters(filters = [], controls = []) {
  return filters.map(f => {
    let control = _.find(controls, { controlId: f.controlId });
    if (control) {
      control = turnControl(control);
    }
    if (control && _.includes([6, 8, 31], control.type)) {
      f.filterType = 11;
    }
    if (
      control &&
      _.includes(
        [
          WIDGETS_TO_API_TYPE_ENUM.TEXT, // 文本
          WIDGETS_TO_API_TYPE_ENUM.TELEPHONE, // 电话号码
          WIDGETS_TO_API_TYPE_ENUM.MOBILE_PHONE, // 手机号码
          WIDGETS_TO_API_TYPE_ENUM.EMAIL, // 邮件地址
          WIDGETS_TO_API_TYPE_ENUM.CRED, // 证件
          WIDGETS_TO_API_TYPE_ENUM.CONCATENATE, // 文本组合
          WIDGETS_TO_API_TYPE_ENUM.AUTO_ID, // 自动编号
        ],
        control.type,
      )
    ) {
      f.filterType = 1;
    }
    if (control && _.includes([10], control.type)) {
      f.advancedSetting.allowitem = '2';
    }
    f.values = f.values || [];
    return f;
  });
}

export function getTitleControl(control, controls) {
  let titleControl =
    get(control, 'advancedSetting.showtitleid') &&
    find(controls, { controlId: get(control, 'advancedSetting.showtitleid') });
  if (!titleControl) {
    const attributeTitle = find(controls, { attribute: 1 });
    titleControl = attributeTitle;
  }
  return titleControl;
}

export function getTableConfig(controlsForShow, { titleControl, coverControl } = {}) {
  let fixedColumnCount = 1;
  let visibleControls = controlsForShow;
  if (titleControl) {
    visibleControls = [titleControl].concat(visibleControls.filter(c => c.controlId !== titleControl.controlId));
  }
  if (coverControl) {
    fixedColumnCount += 1;
    visibleControls = [coverControl].concat(visibleControls.filter(c => c.controlId !== coverControl.controlId));
  }
  return {
    visibleControls,
    fixedColumnCount,
  };
}

export function getEmptyText({ keyWords, error } = {}) {
  if (error) {
    return ERROR_MESSAGE[error];
  }
  return keyWords ? _l('没有搜索结果') : _l('暂无记录');
}

export function getNumFromLocalStorage(key, defaultValue) {
  return localStorage.getItem(key) &&
    !isNaN(Number(localStorage.getItem(key))) &&
    isNumber(Number(localStorage.getItem(key)))
    ? Number(localStorage.getItem(key))
    : defaultValue;
}
