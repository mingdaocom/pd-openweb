import React, { Component, Fragment } from 'react';
import { object, number } from 'prop-types';
import cx from 'classnames';
import UserHead from 'src/pages/feed/components/userHead/userHead';
import { Tooltip, Icon, Linkify } from 'ming-ui';
import moment from 'moment';
import { renderToString } from 'react-dom/server';
import { operation } from '../../api/instance';
import _ from 'lodash';
import './StepItem.less';

const UNNECESSARY_OPERATION_CODE = 22;
const OVERRULE = 5;

const WAIT_TEXT = {
  3: _l('等你填写...'),
  4: _l('等你审核...'),
  5: _l('等你查看...'),
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
  4: _l('通过申请'),
  5: _l('否决申请'),
  8: _l('转审'),
  9: _l('添加审批人'),
  16: _l('审批前加签'),
  17: _l('通过申请并加签'),
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
const formatTime = time => moment(time).format('YYYY年MMMDo HH:mm');

export default class StepItem extends Component {
  static propTypes = {
    data: object,
    currentType: number,
    currentWork: object,
  };
  static defaultProps = {
    data: {},
    currentType: 0,
    currentWork: {},
  };

  state = {
    operated: false,
  };

  /**
   * 节点步骤一经渲染便不会改变,故阻止更新以优化性能
   */
  shouldComponentUpdate(nextProps, nextState) {
    if (nextState.operated !== this.state.operated) {
      return true;
    }

    return false;
  }

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
        return <div className="waitInfo current Font14">{WAIT_TEXT[type]}</div>;
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
            {triggerField && <span className="triggerField"> ({triggerField})</span>}
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
            <div className="userName">{workItemAccount.fullName}</div>
            <div className="timeAction flexRow">
              {action !== UNNECESSARY_OPERATION_CODE && (
                <span className="Gray_9e">{_l('于 %0', formatTime(operationTime))}</span>
              )}

              <div className={cx('action', `action-${action}`)}>
                {action === UNNECESSARY_OPERATION_CODE ? UNNECESSARY_OPERATION[type] : OPERATION_LOG_ACTION[action]}
              </div>
              {actionTargetName && <div className="targetName">{actionTargetName}</div>}
            </div>
            {fields && (
              <div className="info Font12">
                <span className="pointer">{_l('填写了%0个字段', fields.length)}</span>
                {!!fields.length && (
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
                    <span className="modifiedFieldInfo">
                      <Icon icon="workflow_info" className="Font16 Gray_9e" />
                    </span>
                  </Tooltip>
                )}
              </div>
            )}
            {opinion && (
              <div className="info Font12">
                {_l('备注: ')}
                {opinion}
              </div>
            )}
          </Fragment>
        );
      }

      /**
       *  审批节点
       */
      if (type === 4) {
        return (
          <Fragment>
            <div className="userName">{workItemAccount.fullName}</div>
            <div className="timeAction flexRow">
              {action !== UNNECESSARY_OPERATION_CODE && (
                <span className="Gray_9e">{_l('于 %0', formatTime(operationTime))}</span>
              )}

              {action === UNNECESSARY_OPERATION_CODE ? (
                <Fragment>
                  <div className={cx('action', `action-${action}`)}>{UNNECESSARY_OPERATION[type]}</div>
                  {actionTargetName && <div className="targetName">{actionTargetName}</div>}
                </Fragment>
              ) : (
                <Fragment>
                  <div className={cx('action', `action-${action}`)}>
                    {action === OVERRULE && actionTargetName
                      ? _l('退回到%0', actionTargetName)
                      : OPERATION_LOG_ACTION[action]}
                  </div>
                </Fragment>
              )}
            </div>
            {opinion && (
              <div className="info Font12">
                {_l('备注：')}
                {opinion}
              </div>
            )}
            {signature && (
              <div className="info Font12 flexRow">
                <div>{_l('签名：')}</div>
                <div className="flex infoSignature" style={{ backgroundImage: `url(${signature.server})` }} />
              </div>
            )}
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
            <div className="timeAction flexRow">
              <span className="Gray_9e">{_l('于 %0', formatTime(operationTime))}</span>
              <div className="action">{_l('查看')}</div>
            </div>
          </Fragment>
        );
      }
    }
  };

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
      return <span className="Gray_9e">{_l('耗时：%0', this.covertTime(maxTimeConsuming))}</span>;
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

  render() {
    const { data, currentWork, currentType } = this.props;
    const { operated } = this.state;
    const {
      instanceId,
      workId,
      flowNode,
      workItems,
      countersign,
      countersignType,
      condition,
      multipleLevelType,
      sort,
      allowUrge,
    } = data || {};
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
            {allowUrge && !operated && (
              <span
                className="Gray_9e ThemeHoverColor3 mLeft10 pointer"
                style={{ borderBottom: `2px dotted #ddd` }}
                onClick={() => {
                  this.setState({ operated: true });
                  operation({ id: instanceId, workId, operationType: 18 });
                }}
              >
                {_l('催办')}
              </span>
            )}
            {operated && <span className="Gray_9e mLeft10">{_l('已催办')}</span>}
          </div>
          <div className="stepContentWrap mTop10">
            <div className={'stepName bold Font15 flex ellipsis'}>
              {flowNode.name}
              {multipleLevelType !== 0 && sort && _l('（第%0级）', sort)}
            </div>
            {countersign && (
              <div className="signTypeWrap flexRow">
                {countersignType === 3 ? (
                  <Fragment>
                    <span className="nowrap">{currentType === 3 ? _l('填写') : _l('或签')}：</span>
                    <div className="signType">{MULTIPLE_OPERATION[currentType || '4']}</div>
                  </Fragment>
                ) : (
                  <Fragment>
                    <span className="nowrap">{_l('会签')}：</span>
                    <div className="signType">
                      {condition ? condition + '%' : ''}
                      {SIGN_TYPE[countersignType]}
                    </div>
                  </Fragment>
                )}
              </div>
            )}

            {workItems[0].type === 5 && (
              <Fragment>
                <div className="Gray_9e pLeft16 pRight16 pTop10">{_l('通知内容：')}</div>
                <div
                  className="pLeft16 pRight16 pTop5 breakAll"
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
                    <UserHead lazy="false" size={33} user={{ userHead: avatar, accountId }} />
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
