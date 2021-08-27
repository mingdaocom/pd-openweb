import React from 'react';
import Icon from 'ming-ui/components/Icon';
import { NODE_ICON } from './config';

export default ({ type, appType, actionId }) => {
  let { icon, bgColor } = NODE_ICON[type] || {};

  if (typeof icon === 'object') {
    icon = icon[actionId] || icon[appType];
  }

  if (typeof bgColor === 'object') {
    bgColor = bgColor[actionId] || bgColor[appType];
  }

  return (
    <div className="workflowNodeIconWrap" style={{ backgroundColor: bgColor, width: 22, height: 22 }}>
      <Icon icon={icon} style={{ color: '#fff' }} />
    </div>
  );
};
