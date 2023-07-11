import React, { Component, Fragment } from 'react';
import { string, bool, func } from 'prop-types';
import cx from 'classnames';
import Icon from 'ming-ui/components/Icon';
import './index.less';

const STATUS2TEXT = {
  active: _l('运行中%03001'),
  close: _l('已关闭%03002'),
};

export default class Switch extends Component {
  static propTypes = {
    /** 是否禁止关闭 */
    disabledClose: bool,
    /** 流程运行状态 */
    status: string,
    /** 流程是否需要重新发布 */
    isRefresh: bool,
    /** 流程是否为新建流程 */
    isNew: bool,
    /** 流程状态是否正在改变 */
    pending: bool,
    /** 自定义类名 */
    className: string,
    /** 切换状态 */
    switchStatus: func,
    /** 发布流程函数 */
    publishFlow: func,
    /** 重新发布函数 */
    refreshPublish: func,
  };
  static defaultProps = {
    disabledClose: false,
    status: 'close',
    pending: false,
    isRefresh: true,
    isNew: false,
    switchStatus: () => {},
    publishFlow: () => {},
    refreshPublish: () => {},
  };

  state = {
    disabled: false,
  };

  componentWillReceiveProps(nextProps, nextState) {
    if (!nextProps.pending && this.props.pending) {
      this.setState({ disabled: false });
    }
  }

  handleClick = type => {
    const { publishFlow, switchStatus, refreshPublish } = this.props;

    this.setState({ disabled: true });

    if (type === 'publish') publishFlow();
    if (type === 'switchStatus') switchStatus();
    if (type === 'refreshPublish') refreshPublish();
  };

  render() {
    const { disabledClose, pending, status, isNew, isRefresh, className } = this.props;
    const { disabled } = this.state;

    return (
      <div className={cx('workflowStatusWrap', className)}>
        {isNew ? (
          <div className="publishFlowWrap" onClick={() => !disabled && this.handleClick('publish')}>
            <div className="publishFlow">{pending ? _l('发布中...') : _l('发布流程%03088')}</div>
          </div>
        ) : (
          <Fragment>
            {isRefresh && (
              <div className="refreshFlowWrap" onClick={() => !disabled && this.handleClick('refreshPublish')}>
                <div className="refreshFlow">{_l('更新发布')}</div>
              </div>
            )}
            <div
              className={cx('switchWrap', `switchWrap-${status}`, { pending })}
              onClick={() => !disabledClose && !disabled && this.handleClick('switchStatus')}
            >
              <div className={cx('contentWrap', `contentWrap-${status}`)}>
                <div>{STATUS2TEXT[status]}</div>
              </div>
              <div className={cx('iconWrap', `iconWrap-${status}`)}>
                <Icon icon="hr_ok" className={cx('Font20 Gray_bd', `workflowSwitchIcon-${status}`)} />
              </div>
            </div>
          </Fragment>
        )}
      </div>
    );
  }
}
