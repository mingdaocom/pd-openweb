import React from 'react';
import cx from 'classnames';
import Icon from 'ming-ui/components/Icon';
import { FLOW_STATUS } from '../config';

const STATUS2ICON = {
  pending: 'play_arrow',
  suspend: 'workflow_suspend',
  fail: 'workflow_failure',
  completed: 'hr_ok',
  filter: 'workflow_suspend',
  overrule: 'workflow_suspend',
  revoke: 'repeal-o',
  delete: 'report',
};
export default ({
  isList = false,
  statusCode = 1,
  config = FLOW_STATUS,
  size = 30,
  color = '#151515',
  textSize = 14,
}) => {
  const { status, text } = config[statusCode];
  return (
    <div className="historyStatus">
      <div
        className={cx('historyStatusIcon', { blockIcon: isList }, status)}
        style={isList ? {} : { width: size, height: size }}
      >
        <Icon icon={isList ? 'circle' : STATUS2ICON[status]} style={{ fontSize: size / 1.5 }} />
      </div>
      <div className="statusText" style={{ color, fontSize: textSize }}>
        {text}
      </div>
    </div>
  );
};
