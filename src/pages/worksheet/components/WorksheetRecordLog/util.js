import {
  WFSTATUS_OPTIONS, WF_STATUS,
} from './enum.js';
import moment from 'moment';
import _ from 'lodash';
import renderText from 'src/pages/worksheet/components/CellControls/renderText.js';

export function assembleListData(data) {
  let _resArr = [];
  // 前后相邻的两条 时间在同一天 且 操作者相同 的 并为一条
  data.forEach(item => {
    if (
      !_resArr.length ||
      !moment(_resArr[_resArr.length - 1].time).isSame(item.createTime, 'day') ||
      _resArr[_resArr.length - 1].accountId !== item.accountId
    ) {
      _resArr.push({
        time: item.createTime,
        accountName: item.accountName,
        accountId: item.accountId,
        child: [].concat(item),
        avatar: item.avatar,
      });
    } else {
      _resArr[_resArr.length - 1].child.push(item);
    }
  });

  return _resArr;
};

export function assembleNewLogListData(data) {
  let _resArr = [];
  // 前后相邻的两条 时间在同一天 且 操作者相同 的 并为一条
  data.forEach((item, index) => {
    if (
      !_resArr.length ||
      !moment(_resArr[_resArr.length - 1].time).isSame(item.operatContent.createTime, 'day') ||
      _resArr[_resArr.length - 1].accountId !== item.opeartorInfo.accountId ||
      _resArr[_resArr.length - 1].type !== item.operatContent.type ||
      _resArr[[_resArr.length - 1]].requestType !== item.operatContent.requestType ||
      item.operatContent.requestType === 7 ||
      item.operatContent.requestType === 2
    ) {
      _resArr.push({
        ...item.opeartorInfo,
        time: item.operatContent.createTime,
        accountName: item.opeartorInfo.fullname,
        type: item.operatContent.type,
        requestType: item.operatContent.requestType,
        child: [].concat(item),
      });
    } else {
      _resArr[_resArr.length - 1].child.push(item);
    }
  });

  return _resArr;
};

export function getShowWfstatusValue(option) {
  if (!option) return null;
  let value = _.startsWith(option, '[') ? safeParse(option, 'array')[0] : option;
  if(!value && option) {
    value = option;
  }
  if (_.startsWith(value, 'other')) {
    return value === 'other' ? _l('其他') : _.replace(value, 'other:', '') || _l('其他');
  }
  if (_.startsWith(value, '其他')) {
    return value === '其他' ? _l('其他') : _.replace(value, '其他:', '') || _l('其他');
  }
  if (WF_STATUS.hasOwnProperty(value)) {
    return WF_STATUS[value];
  }
  return WFSTATUS_OPTIONS.find(l => l.key === value) ? WFSTATUS_OPTIONS.find(l => l.key === value).value : value;
};

export const numberControlHandle = (list, control, type) => {
  return list.map(l => {
    let number = renderText({ ...control, value: l }, {noMask: true});
    if ((control || {}).dot === 0 && type === 6 && _.endsWith(number, '.0')) {
      return number.replace('.0', '');
    } else {
      return number;
    }
  })
}
