import React from 'react';
import { CheckCircleFilled, CloseCircleFilled, ExclamationCircleFilled, InfoCircleFilled } from '@ant-design/icons';
import _ from 'lodash';
import { isUnTextWidget } from 'src/components/Form/core/utils';
import { isCustomWidget } from '../../../util';

// 事件
export const ADD_EVENT_ENUM = {
  CHANGE: '1',
  SHOW: '2',
  HIDE: '3',
  FOCUS: '4',
  BLUR: '5',
  CLICK: '6',
};

export const ADD_EVENT_DISPLAY = [
  { text: _l('值改变时'), value: ADD_EVENT_ENUM.CHANGE },
  { text: _l('显示时'), value: ADD_EVENT_ENUM.SHOW },
  { text: _l('隐藏时'), value: ADD_EVENT_ENUM.HIDE },
  { text: _l('获取焦点时'), value: ADD_EVENT_ENUM.FOCUS },
  { text: _l('失去焦点时'), value: ADD_EVENT_ENUM.BLUR },
  // 暂时隐藏，按钮组件做了再加
  // { text: _l('点击时'), value: ADD_EVENT_ENUM.CLICK },
];

export const dealEventDisplay = (data = {}, list = []) => {
  if (isUnTextWidget(data)) {
    return list;
  } else {
    return list.map(i => (i.value === ADD_EVENT_ENUM.CHANGE ? VALUE_CHANGE : i));
  }
};

// 异化值改变时文案，文本类控件使用
export const VALUE_CHANGE = { text: _l('值改变并失去焦点时'), value: ADD_EVENT_ENUM.CHANGE };

// 事件筛选类型
export const FILTER_VALUE_ENUM = {
  CONTROL_VALUE: '1',
  SEARCH_WORKSHEET: '2',
  API: '3',
  CUSTOM_FUN: '4',
};

export const FILTER_VALUE_TYPE = [
  { text: _l('按字段值'), value: FILTER_VALUE_ENUM.CONTROL_VALUE },
  { text: _l('按查询工作表'), value: FILTER_VALUE_ENUM.SEARCH_WORKSHEET },
  // { text: _l('按调用已集成 API'), value: FILTER_VALUE_ENUM.API },
  { text: _l('按自定义函数'), value: FILTER_VALUE_ENUM.CUSTOM_FUN },
];

export const ACTION_VALUE_ENUM = {
  SHOW: '1',
  HIDE: '2',
  EDIT: '3',
  READONLY: '4',
  SET_VALUE: '5',
  ERROR: '6',
  REFRESH_VALUE: '7',
  API: '8',
  MESSAGE: '9',
  VOICE: '10',
  LINK: '11',
  CREATE: '12',
  OPERATION_FLOW: '13',
  SEARCH_WORKSHEET: '14',
  ACTIVATE_TAB: '15',
};

// 事件动作类型
export const ACTION_VALUE_TYPE = [
  { text: _l('显示/隐藏'), value: ACTION_VALUE_ENUM.SHOW },
  { text: _l('设置只读/可编辑'), value: ACTION_VALUE_ENUM.READONLY },
  { text: _l('设置字段值'), value: ACTION_VALUE_ENUM.SET_VALUE },
  { text: _l('刷新字段值'), value: ACTION_VALUE_ENUM.REFRESH_VALUE },
  // { text: _l('提示错误'), value: ACTION_VALUE_ENUM.ERROR },
  { text: _l('查询工作表'), value: ACTION_VALUE_ENUM.SEARCH_WORKSHEET },
  { text: _l('调用封装业务流程'), value: ACTION_VALUE_ENUM.OPERATION_FLOW },
  { text: _l('调用已集成 API'), value: ACTION_VALUE_ENUM.API },
  { text: _l('提示消息'), value: ACTION_VALUE_ENUM.MESSAGE },
  { text: _l('播放声音'), value: ACTION_VALUE_ENUM.VOICE },
  { text: _l('激活标签页'), value: ACTION_VALUE_ENUM.ACTIVATE_TAB },
  { text: _l('打开链接'), value: ACTION_VALUE_ENUM.LINK },
  { text: _l('创建新纪录'), value: ACTION_VALUE_ENUM.CREATE },
];

// 条件信息
export const EVENT_DETAIL = [
  { color: '#00c345', bgColor: '#DBF0DC' },
  { color: '#ff9300', bgColor: '#FFEBCD' },
  { color: '#f52222', bgColor: 'rgba(245, 34, 34, 0.6)' },
  { color: '#1677ff', bgColor: 'rgba(33, 150, 243, 0.6)' },
];

// 更多操纵
export const EVENT_MORE_OPTIONS = [
  { text: _l('修改条件描述'), value: 'edit', icon: 'edit' },
  { text: _l('复制'), value: 'copy', icon: 'copy' },
  { text: _l('删除'), value: 'delete', icon: 'trash' },
];

// 消息提示类型
export const ALERT_TYPE_OPTIONS = [
  { text: _l('成功'), value: '1', icon: <CheckCircleFilled style={{ color: '#00C345' }} /> },
  { text: _l('失败'), value: '2', icon: <CloseCircleFilled style={{ color: '#F52222' }} /> },
  { text: _l('警告'), value: '3', icon: <ExclamationCircleFilled style={{ color: '#FF9A00' }} /> },
  { text: _l('通知'), value: '4', icon: <InfoCircleFilled style={{ color: '#1677ff' }} /> },
];

const SUPPORT_VALUE_CHANGE_WIDGET = [
  2, 6, 8, 5, 15, 16, 46, 3, 4, 19, 23, 24, 9, 10, 11, 26, 27, 48, 14, 36, 28, 41, 7, 40, 42, 50, 29, 34, 35,
];
const SUPPORT_FOCUS_WIDGET = [2, 8, 5, 3, 4, 41, 7];

// 根据字段类型筛选支持的事件
export const getEventDisplay = (data = {}) => {
  const filterEventEnum = [ADD_EVENT_ENUM.SHOW, ADD_EVENT_ENUM.HIDE];
  if (_.includes(SUPPORT_VALUE_CHANGE_WIDGET, data.type)) {
    filterEventEnum.push(ADD_EVENT_ENUM.CHANGE);
  }
  if (
    (_.includes(SUPPORT_FOCUS_WIDGET, data.type) && !isCustomWidget(data)) ||
    (data.type === 6 && _.get(data, 'advancedSetting.showtype') === '0')
  ) {
    filterEventEnum.push(ADD_EVENT_ENUM.FOCUS, ADD_EVENT_ENUM.BLUR);
  }

  return ADD_EVENT_DISPLAY.filter(i => _.includes(filterEventEnum, i.value));
};

// 根据字段类型筛选支持的动作
export const getActionDisplay = eventType => {
  if (!_.includes([ADD_EVENT_ENUM.CLICK], eventType)) {
    const filterAction = [ACTION_VALUE_ENUM.LINK, ACTION_VALUE_ENUM.CREATE];
    return ACTION_VALUE_TYPE.filter(i => !_.includes(filterAction, i.value));
  }
  return ACTION_VALUE_TYPE;
};

// 根据动作类型展示文案
export const getActionTextByValue = type => {
  switch (type) {
    case ACTION_VALUE_ENUM.SHOW:
      return _l('显示');
    case ACTION_VALUE_ENUM.HIDE:
      return _l('隐藏');
    case ACTION_VALUE_ENUM.EDIT:
      return _l('设为可编辑');
    case ACTION_VALUE_ENUM.READONLY:
      return _l('设为只读');
    default:
      return _.get(
        _.find(ACTION_VALUE_TYPE, a => a.value === type),
        'text',
      );
  }
};

// 查询工作表新加结果条件
export const RESULT_DISPLAY = [
  { text: _l('查询到记录'), value: 0 },
  { text: _l('仅查询到一条记录'), value: 1 },
  { text: _l('查询到多条记录'), value: 2 },
  { text: _l('未查询到记录'), value: 3 },
];

// 且、或
export const SPLICE_TYPE_ENUM = {
  AND: '1',
  OR: '2',
};

export const FILTER_SPLICE_TYPE = [
  { text: _l('且'), value: '1' },
  { text: _l('或'), value: '2' },
];

//支持配默认值的字段
export const HAS_DYNAMIC_TYPE = [
  2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 15, 16, 19, 23, 24, 26, 27, 28, 29, 34, 35, 36, 41, 46, 48,
];

export const VOICE_FILE_LIST = [
  { fileKey: '1', filePath: require('/staticfiles/images/custom_classics.mp3'), fileName: _l('经典') },
  { fileKey: '2', filePath: require('/staticfiles/images/custom_bubbling.mp3'), fileName: _l('冒泡') },
  { fileKey: '3', filePath: require('/staticfiles/images/custom_diamond.mp3'), fileName: _l('钻石') },
  { fileKey: '4', filePath: require('/staticfiles/images/custom_flicker.mp3'), fileName: _l('闪烁') },
  { fileKey: '5', filePath: require('/staticfiles/images/custom_dong_dong.mp3'), fileName: _l('咚咚') },
  { fileKey: '6', filePath: require('/staticfiles/images/custom_alarm.mp3'), fileName: _l('警报') },
  { fileKey: '7', filePath: require('/staticfiles/images/custom_ding_dong.mp3'), fileName: _l('叮咚') },
  { fileKey: '8', filePath: require('/staticfiles/images/custom_gold.mp3'), fileName: _l('金币掉落') },
  { fileKey: '9', filePath: require('/staticfiles/images/custom_cheer.mp3'), fileName: _l('欢呼') },
  { fileKey: '10', filePath: require('/staticfiles/images/custom_success.mp3'), fileName: _l('成功') },
  { fileKey: '11', filePath: require('/staticfiles/images/custom_drum.mp3'), fileName: _l('鼓掌') },
  { fileKey: '12', filePath: require('/staticfiles/images/custom_quiet.mp3'), fileName: _l('静音') },
];
