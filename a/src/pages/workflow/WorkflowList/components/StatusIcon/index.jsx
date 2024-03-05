import React, { Component } from 'react';
import { number, string, shape } from 'prop-types';
import cx from 'classnames';
import Icon from 'ming-ui/components/Icon';
import './index.less';

const MSG_TEMPLATE_STATUS_TO_TEXT = {
  0: {
    id: 'pending',
    text: _l('审核中...'),
    icon: 'start_time',
    size: 18,
  },
  1: {
    id: 'pass',
    text: _l('审核通过'),
    icon: 'check_circle',
    color: '#01ca83',
  },
  2: {
    id: 'fail',
    text: _l('审核失败'),
    icon: 'workflow_failure',
    color: '#f44336',
  },
};

export default class StatusIcon extends Component {
  static propTypes = {
    config: shape({ icon: string, text: string, size: number, color: string }),
    status: number,
    className: string,
  };
  static defaultProps = {
    config: MSG_TEMPLATE_STATUS_TO_TEXT,
    status: 0,
  };
  render() {
    const { config, status, className } = this.props;
    const { text, icon, size = 16, color = '#757575' } = config[status];
    return (
      <div className={cx('workflowStatusIconWrap', className)}>
        <Icon style={{ fontSize: size, color }} icon={icon} />
        <div className="explainText">{text}</div>
      </div>
    );
  }
}
