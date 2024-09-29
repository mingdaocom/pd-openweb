import React from 'react';
import Icon from 'ming-ui/components/Icon';
import { NODE_ICON } from '../config';
import { APP_TYPE, ACTION_ID } from '../../enum';

export default ({ type, appType, actionId, isPlugin, isFirst, isLast }) => {
  let { icon, bgColor } = NODE_ICON[type] || {};

  if (typeof icon === 'object') {
    icon = icon[actionId] || icon[appType];
  }

  if (typeof bgColor === 'object') {
    bgColor = bgColor[actionId] || bgColor[appType];
  }

  // 处理特殊的外部门户节点
  if (appType === APP_TYPE.EXTERNAL_USER) {
    icon = actionId === ACTION_ID.ADD ? 'invited_users' : 'update_information';
  }

  // 处理特殊的任务节点
  if (appType === APP_TYPE.TASK) {
    icon = 'custom_assignment';
    bgColor = '#01CA83';
  }

  // 处理特殊的日程节点
  if (appType === APP_TYPE.CALENDAR) {
    icon = 'sidebar_calendar';
    bgColor = '#F15B75';
  }

  // 处理特殊的webhook 事件推送
  if (appType === APP_TYPE.EVENT_PUSH) {
    icon = 'sending';
  }

  // 插件输入参数异化
  if (isPlugin && isFirst) {
    bgColor = '#2196f3';
  }

  // 插件输出参数异化
  if (isPlugin && isLast) {
    icon = 'output';
    bgColor = '#2196f3';
  }

  return (
    <div className="workflowNodeIconWrap" style={{ backgroundColor: bgColor, width: 22, height: 22 }}>
      <Icon icon={icon} style={{ color: '#fff' }} />
    </div>
  );
};
