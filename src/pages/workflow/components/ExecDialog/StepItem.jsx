import React, { Component, Fragment } from 'react';
import { object, number, bool, func, string } from 'prop-types';
import cx from 'classnames';
import UserHead from 'src/pages/feed/components/userHead/userHead';
import { Tooltip, Icon, Linkify, Menu, MenuItem } from 'ming-ui';
import { ActionSheet } from 'antd-mobile';
import moment from 'moment';
import { renderToString } from 'react-dom/server';
import { operation, revoke } from '../../api/instance';
import _ from 'lodash';
import './StepItem.less';
import { browserIsMobile } from 'src/util';

const UNNECESSARY_OPERATION_CODE = 22;
const OVERRULE = 5;

const WAIT_TEXT = {
  3: _l('等我填写...'),
  4: _l('等我审批...'),
  5: _l('等我查看...'),
};

const SIGN_TYPE = {
  1: _l('需全员通过'),
  2: _l('只需一人通过，需全员否决'),
  4: _l('及以上的成员通过后即视为节点通过'),
};

const MULTIPLE_OPERATION = {
  3: _l('设置多个填写人,由任意一人进行填写'),
  4: _l('设置多个审批人,由任意一人进行审批'),
};

const OPERATION_LOG_ACTION = {
  0: _l('发起'),
  1: _l('提交'),
  2: _l('转交'),
  3: _l('查看'),
  4: _l('通过'),
  5: _l('否决'),
  8: _l('转审'),
  9: _l('添加审批人'),
  16: _l('审批前加签'),
  17: _l('同意并加签'),
  18: _l('修改申请内容'),
  22: _l('无需审批'),
};

const UNNECESSARY_OPERATION = {
  3: _l('无需填写'),
  4: _l('无需审批'),
};

const START_TYPE_TEXT = {
  1: _l('新增记录'),
  2: _l('新增或更新记录'),
};

/**
 * 格式化时间
 */
const formatTime = time => moment(time).format('YYYY.MM.DD HH:mm');

export default class StepItem extends Component {
  static propTypes = {
    data: object,
    currentType: number,
    currentWork: object,
    firstWorkId: string,
    isAppAdmin: bool,
    isLast: bool,
    onClose: func,
  };
  static defaultProps = {
    data: {},
    currentType: 0,
    currentWork: {},
    isAppAdmin: false,
    isLast: false,
    onClose: () => {},
  };

  state = {
    moreOperationVisible: false,
  };

  /**
   * 节点步骤一经渲染便不会改变,故阻止更新以优化性能
   */
  shouldComponentUpdate(nextProps, nextState) {
    if (nextState.moreOperationVisible !== this.state.moreOperationVisible) {
      return true;
    }

    return false;
  }

  /**
   * mobile端的更多操作
   */
  handleOperatorAction = () => {
    const { data, isAppAdmin, isLast, firstWorkId, onClose } = this.props;
    const { moreOperationVisible } = this.state;
    const { instanceId, workId, allowUrge } = data || {};
    const handleUrge = () => {
      operation({ id: instanceId, workId, operationType: 18 }).then(data => {
        alert(_l('已催办'));
      });
    };
    const handleRevoke = () => {
      revoke({ id: instanceId, workId: isAppAdmin ? firstWorkId : workId });
      onClose();
    };
    const BUTTONS = [
      { name: _l('催办'), icon: 'hr_message_reminder', fn: handleUrge },
      { name: _l('撤回'), icon: 'restart', fn: handleRevoke },
    ];
    ActionSheet.showActionSheetWithOptions({
      options: BUTTONS.map(item => (
        <div className="flexRow valignWrapper w100" onClick={item.fn}>
          <Icon className="mRight10 Font18 Gray_9e" icon={item.icon} />
          <span className="Bold">{item.name}</span>
        </div>
      )),
      message: (
        <div className="flexRow header">
          <span className="Font13">{_l('操作')}</span>
          <div className="closeIcon" onClick={() => ActionSheet.close()}>
            <Icon icon="close" />
          </div>
        </div>
      ),
    });
  };

  /**
   * 根据类型的不同渲染内容
   */
  renderDetail = item => {
    let { data, currentWork } = this.props;
    let { workId, flowNode = {} } = data || {};
    const { type, workItemAccount, operationTime, opinion, workItemLog, viewTime, signature } = item;
    /** 是否是当前用户 */
    let isCurrentUser = md.global.Account.accountId === workItemAccount.accountId;
    /** 是否是当前流程节点 */
    let isCurrentWork = workId === (currentWork || {}).workId;
    if (!operationTime) {
      if (workItemLog && workItemLog.action === UNNECESSARY_OPERATION_CODE) {
        return (
          <Fragment>
            <div className="userName">{workItemAccount.fullName}</div>
            <div className="info">{UNNECESSARY_OPERATION[type]}</div>
          </Fragment>
        );
      }
      if (isCurrentWork && isCurrentUser) {
        return <div className="waitInfo current Font14 bold">{WAIT_TEXT[type]}</div>;
      }
      return (
        <Fragment>
          <div className="userName">{workItemAccount.fullName}</div>
          <div className="info">{viewTime ? _l('已查看') : _l('未查看')}</div>
        </Fragment>
      );
    }
    /**
     * 发起流程
     */
    if (type === 0) {
      const { triggerId, triggerField } = flowNode;
      return (
        <Fragment>
          <div className="userName">{workItemAccount.fullName}</div>
          <div className="info">
            {START_TYPE_TEXT[triggerId]}
            {triggerField && <span className="mLeft4"> ({triggerField})</span>}
          </div>
        </Fragment>
      );
    }
    if (workItemLog) {
      const { action, actionTargetName, fields } = workItemLog;

      /**
       * 填写节点
       */
      if (type === 3) {
        return (
          <Fragment>
            <div className="flexRow alignItemsCenter">
              <div className="userName">{workItemAccount.fullName}</div>
              <div className={cx('action ellipsis', `action-${action}`)}>
                {action === UNNECESSARY_OPERATION_CODE
                  ? UNNECESSARY_OPERATION[type]
                  : fields
                  ? this.renderWriteFields(fields)
                  : OPERATION_LOG_ACTION[action] + (_.includes([2], action) ? actionTargetName : '')}
              </div>
            </div>
            {opinion && <div className="info Gray_9e">{opinion}</div>}
            <div className="timeAction flexRow Gray_9e">
              {action !== UNNECESSARY_OPERATION_CODE && (
                <Fragment>
                  {formatTime(operationTime)}
                  <span className="mLeft4">{_l('提交')}</span>
                </Fragment>
              )}
            </div>
          </Fragment>
        );
      }

      /**
       *  审批节点
       */
      if (type === 4) {
        return (
          <Fragment>
            <div className="flexRow alignItemsCenter">
              <div className="userName">{workItemAccount.fullName}</div>
              <div className={cx('action ellipsis', `action-${action}`)}>
                {action === UNNECESSARY_OPERATION_CODE
                  ? UNNECESSARY_OPERATION[type]
                  : action === OVERRULE && actionTargetName
                  ? _l('退回到%0', actionTargetName)
                  : OPERATION_LOG_ACTION[action] + (_.includes([8, 9, 16, 17], action) ? actionTargetName : '')}
              </div>
            </div>
            {fields && fields.length && <div className="mTop4">{this.renderWriteFields(fields)}</div>}
            {opinion && <div className="info Gray_9e">{opinion}</div>}
            {signature && <div className="infoSignature" style={{ backgroundImage: `url(${signature.server})` }} />}
            <div className="timeAction flexRow Gray_9e">
              {action !== UNNECESSARY_OPERATION_CODE && formatTime(operationTime)}
            </div>
          </Fragment>
        );
      }

      /**
       * 通知节点
       */
      if (type === 5) {
        return (
          <Fragment>
            <div className="userName">{workItemAccount.fullName}</div>
            <div className="timeAction flexRow Gray_9e">
              {formatTime(operationTime)}
              <span className="mLeft4">{_l('查看')}</span>
            </div>
          </Fragment>
        );
      }
    }
  };

  /**
   * 渲染填写的字段
   */
  renderWriteFields(fields) {
    if (!fields || !fields.length) return null;

    return (
      <Fragment>
        <span className="pointer Font14 ThemeColor3">{_l('填写%0个字段', fields.length)}</span>
        {!!fields.length && !browserIsMobile() && (
          <Tooltip
            tooltipClass="workflowStepFieldsWrap "
            popupPlacement={'bottom'}
            text={
              <ul>
                {fields.map(({ name, toValue }, index) => (
                  <li key={index} className="writeFields">
                    <span className="field">{`${name}: `}</span>
                    <span className="val">{toValue}</span>
                  </li>
                ))}
              </ul>
            }
          >
            <Icon icon="workflow_info" className="Font16 Gray_9e mLeft4" />
          </Tooltip>
        )}
      </Fragment>
    );
  }

  /**
   * 生成链接
   */
  generateLink(value) {
    value = value || '';
    const links = value.match(/<a.*?<\/a>/g) || [];

    links.forEach((item, index) => {
      value = value.replace(item, `$${index}$`);
    });

    value = renderToString(<Linkify properties={{ target: '_blank' }}>{value}</Linkify>);

    (value.match(/\$[^ \r\n]+?\$/g) || []).forEach((item, index) => {
      value = value.replace(item, links[index]);
    });

    return value;
  }

  /**
   * 渲染耗时
   */
  renderTimeConsuming() {
    const { data } = this.props;
    const workItems = ((data || {}).workItems || []).filter(item => _.includes([3, 4], item.type));
    const timeConsuming = [];
    const endTimeConsuming = [];

    if (!workItems.length || workItems.filter(item => !item.operationTime).length) return null;

    workItems.forEach(item => {
      // 截止时间
      if (item.dueTime) {
        endTimeConsuming.push(moment(item.operationTime) - moment(item.dueTime));
      }

      timeConsuming.push(moment(item.operationTime) - moment(item.receiveTime));
    });

    const maxTimeConsuming = _.max(timeConsuming) || 0;
    let maxEndTimeConsuming = _.max(endTimeConsuming) || 0;
    let autoPass = false;

    // 特殊文案处理自动逻辑
    if (
      (workItems[0].opinion || '').indexOf('限时自动通过') > -1 ||
      (workItems[0].opinion || '').indexOf('限时自动填写') > -1
    ) {
      maxEndTimeConsuming = 1;
      autoPass = true;
    }

    if (!maxEndTimeConsuming) {
      const time = this.covertTime(maxTimeConsuming);
      return time ? <span className="Gray_9e">{_l('耗时：%0', time)}</span> : null;
    }

    return (
      <span
        className="tip-top-left"
        data-tip={
          autoPass
            ? ''
            : maxEndTimeConsuming > 0
            ? _l('超时 %0 完成', this.covertTime(maxEndTimeConsuming))
            : _l('提前 %0 完成', this.covertTime(maxEndTimeConsuming))
        }
      >
        <span
          className="stepTimeConsuming flexRow"
          style={{
            color: maxEndTimeConsuming > 0 ? '#F44336' : '#4CAF50',
            backgroundColor: maxEndTimeConsuming > 0 ? '#FCE4E3' : '#eef7ee',
          }}
        >
          <Icon icon={maxEndTimeConsuming > 0 ? 'overdue_network' : 'task'} className="Font14 mRight2" />
          {_l('耗时：%0', this.covertTime(maxTimeConsuming))}
        </span>
      </span>
    );
  }

  /**
   * 转换输出时间
   */
  covertTime(time) {
    if (time < 0) time = time * -1;

    const day = Math.floor(time / 24 / 60 / 60 / 1000);
    const hour = Math.floor((time - day * 24 * 60 * 60 * 1000) / 60 / 60 / 1000);
    const min = (time - day * 24 * 60 * 60 * 1000 - hour * 60 * 60 * 1000) / 60 / 1000;

    return `${day ? _l('%0天', day) : ''}${hour ? _l('%0小时', hour) : ''}${
      min ? _l('%0分钟', Math.floor(min) || 1) : ''
    }`;
  }

  /**
   * 渲染剩余时间
   */
  renderSurplusTime() {
    const { data } = this.props;
    let currentAccountNotified = false;
    const workItems = ((data || {}).workItems || []).filter(item => {
      if (item.executeTime && item.workItemAccount.accountId === md.global.Account.accountId) {
        currentAccountNotified = true;
      }
      return _.includes([3, 4], item.type) && !item.operationTime && item.dueTime;
    });

    if (!workItems.length) return null;

    const time = moment() - moment(workItems[0].dueTime) || 0;

    return (
      <span
        className="stepTimeConsuming flexRow"
        style={{
          color: time > 0 ? '#F44336' : currentAccountNotified ? '#FF9800' : '#2196f3',
        }}
      >
        <Icon icon={time > 0 ? 'error1' : 'hourglass'} className="Font14 mRight2" />
        {time > 0 ? _l('已超时%0', this.covertTime(time)) : _l('剩余%0', this.covertTime(time))}
      </span>
    );
  }

  /**
   * 更多操作
   */
  renderOperator() {
    const { data, isAppAdmin, isLast, firstWorkId, onClose } = this.props;
    const { moreOperationVisible } = this.state;
    const { instanceId, workId, allowUrge } = data || {};

    if ((isLast && isAppAdmin) || allowUrge) {
      return (
        <div className="relative">
          <Icon
            icon="more_horiz Gray_9e ThemeHoverColor3 mLeft10 pointer Font22"
            onClick={() =>
              browserIsMobile() ? this.handleOperatorAction() : this.setState({ moreOperationVisible: true })
            }
          />

          {moreOperationVisible && (
            <Menu style={{ left: -150 }} onClickAway={() => this.setState({ moreOperationVisible: false })}>
              {((isLast && isAppAdmin) || allowUrge) && (
                <MenuItem
                  onClick={() => {
                    operation({ id: instanceId, workId, operationType: 18 }).then(data => {
                      alert(_l('已催办'));
                    });
                    this.setState({ moreOperationVisible: false });
                  }}
                >
                  <Icon icon="hr_message_reminder" className="Font14" />
                  <span className="mLeft20">{_l('催办')}</span>
                </MenuItem>
              )}
              {isLast && isAppAdmin && (
                <MenuItem
                  onClick={() => {
                    revoke({ id: instanceId, workId: isAppAdmin ? firstWorkId : workId });
                    onClose();
                  }}
                >
                  <Icon icon="restart" className="Font14" />
                  <span className="mLeft20">{_l('撤回')}</span>
                </MenuItem>
              )}
            </Menu>
          )}
        </div>
      );
    }

    return null;
  }

  render() {
    const { data, currentWork, currentType } = this.props;
    const { workId, flowNode, workItems, countersign, countersignType, condition, multipleLevelType, sort } =
      data || {};
    /** 是否是当前流程节点 */
    let isCurrentWork = workId === (currentWork || {}).workId && _.includes([3, 4, 5], currentType);

    return (
      <li className="workflowStep flexRow">
        <div className={cx('flowPointer flexColumn', { active: isCurrentWork })}>
          <div className={cx('pointerItem', { active: isCurrentWork })} />
          <div className="pointerLine" />
        </div>
        <div className="stepItem flex flexColumn">
          <div className="flexRow alignItemsCenter">
            <div className={cx('stepItemTime Font15 flex ellipsis', isCurrentWork ? 'ThemeColor3 bold' : 'Gray_75')}>
              {workItems[0] && moment(workItems[0].receiveTime).format('MM-DD HH:mm')}
            </div>
            {this.renderTimeConsuming()}
            {this.renderSurplusTime()}
            {this.renderOperator()}
          </div>
          <div className="stepContentWrap mTop10">
            <div className={'stepName bold Font15 flex ellipsis'}>
              {flowNode.name}
              {multipleLevelType !== 0 && sort && _l('（第%0级）', sort)}
            </div>
            {countersign && (
              <div className="mTop10 mLeft16 Gray_9e mRight16">
                {countersignType === 3
                  ? MULTIPLE_OPERATION[flowNode.type || '4']
                  : `${condition ? condition + '%' : ''}${SIGN_TYPE[countersignType]}`}
              </div>
            )}

            {workItems[0].type === 5 && (
              <Fragment>
                <div
                  className="pLeft16 pRight16 pTop6 breakAll Gray_75"
                  style={{ whiteSpace: 'normal' }}
                  dangerouslySetInnerHTML={{
                    __html: filterXSS(this.generateLink(workItems[0].opinion), {
                      stripIgnoreTag: true,
                    }),
                  }}
                />
              </Fragment>
            )}

            {workItems.map((item, index) => {
              let { workItemAccount } = item;
              const { avatar, accountId } = workItemAccount;
              return (
                <div key={index} className="stepContent flexRow">
                  <div className="avatarBox">
                    <UserHead lazy="false" size={36} user={{ userHead: avatar, accountId }} />
                  </div>
                  <div className="stepDetail flex flexColumn">{this.renderDetail(item)}</div>
                </div>
              );
            })}
          </div>
        </div>
      </li>
    );
  }
}
