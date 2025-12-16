import React, { Component, Fragment } from 'react';
import { Checkbox } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import moment from 'moment';
import { Icon, SvgIcon, UserHead } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import { FLOW_FAIL_REASON } from 'src/pages/workflow/WorkflowSettings/History/config';
import { dateConvertToUserZone } from 'src/utils/project';
import { covertTime, FLOW_NODE_TYPE_STATUS, INSTANCELOG_STATUS, TABS } from '../config';
import './index.less';

export default class Card extends Component {
  constructor(props) {
    super(props);
  }
  shouldComponentUpdate(nextProps) {
    return (
      !_.isEqual(this.props.item.id, nextProps.item.id) ||
      this.props.approveChecked !== nextProps.approveChecked ||
      this.props.type !== nextProps.type
    );
  }
  renderHeader() {
    const { stateTab, item, showApproveChecked = true } = this.props;
    const { flowNode, workItem, flowNodeType, currentWorkFlowNodes, completeDate, instanceLog, status } = item;
    let RenderState = null;
    let RenderRightHander = null;
    let RenderResultState = null;

    if ([TABS.WAITING_APPROVE, TABS.WAITING_FILL, TABS.WAITING_EXAMINE].includes(stateTab)) {
      RenderState = (
        <div className="state bold valignWrapper">
          <div className="Font13 Gray_75">{flowNode.name}</div>
        </div>
      );
      RenderRightHander = (
        <div className="valignWrapper">
          {this.renderTime()}
          {stateTab === TABS.WAITING_APPROVE && showApproveChecked && this.renderCheckBox()}
        </div>
      );
    }

    if (stateTab === TABS.WAITING_EXAMINE) {
      RenderRightHander = (
        <div className="valignWrapper">
          <div className="examineTime">{this.renderTime()}</div>
          <div
            className="alreadyRead"
            onClick={event => {
              event.stopPropagation();
              this.props.onAlreadyRead(item);
            }}
          >
            <Icon icon="ok" />
            <span className="mLeft5">{_l('已读')}</span>
          </div>
        </div>
      );
    }

    if (stateTab === TABS.MY_SPONSOR && currentWorkFlowNodes && currentWorkFlowNodes.length) {
      const currentWorkFlowNode = currentWorkFlowNodes[currentWorkFlowNodes.length - 1];
      RenderState = (
        <div className="state bold valignWrapper">
          <div className="Font13 Gray_75">
            {currentWorkFlowNodes.length > 1
              ? _l('%0个节点', currentWorkFlowNodes.length)
              : currentWorkFlowNode
                ? currentWorkFlowNode.name
                : flowNode.name}
          </div>
          <div className="info mLeft5 Gray_75 Font13">{_l('处理中…')}</div>
        </div>
      );
      RenderRightHander = this.renderTime();
    }

    if (stateTab === TABS.COMPLETE) {
      const { type } = this.props;
      const { operationType, operationTime } = workItem;

      if (type === 0) {
        const instanceStatus = status === 3 || status === 4 ? instanceLog.status : status;
        const { text, bg, shallowBg } = INSTANCELOG_STATUS[instanceStatus];
        RenderState = (
          <Fragment>
            <div className="state bold valignWrapper" style={{ backgroundColor: shallowBg }}>
              <div className="Font13" style={{ color: bg }}>
                {text}
              </div>
            </div>
            {instanceLog && instanceLog.cause && instanceStatus !== 5 && (
              <div
                className="Font13 mLeft10 Gray_75 ellipsis"
                style={{ maxWidth: 200 }}
                title={FLOW_FAIL_REASON[instanceLog.cause] || instanceLog.causeMsg}
              >
                {`${instanceLog.cause === 40007 ? '' : _l('节点：')}${
                  FLOW_FAIL_REASON[instanceLog.cause] || instanceLog.causeMsg
                }`}
              </div>
            )}
          </Fragment>
        );
      } else {
        if (FLOW_NODE_TYPE_STATUS[flowNodeType][operationType]) {
          const { text, color, shallowBg } = FLOW_NODE_TYPE_STATUS[flowNodeType][operationType];
          RenderState = (
            <div className="state bold valignWrapper" style={{ color, backgroundColor: shallowBg }}>
              {text}
            </div>
          );
        }
      }
      if (type === 0) {
        RenderRightHander = (
          <div className="Gray_9e mRight10 mLeft10">{createTimeSpan(type === 0 ? completeDate : operationTime)}</div>
        );
      } else {
        const timeConsuming = this.renderTimeConsuming();
        RenderRightHander = (
          <div className="flexRow valignWrapper">
            {timeConsuming && (
              <Fragment>
                {timeConsuming}
                <div style={{ height: 15, width: 1, backgroundColor: '#9e9e9e' }} className="mLeft10" />
              </Fragment>
            )}
            <div className="Gray_9e mRight10 mLeft10">{createTimeSpan(type === 0 ? completeDate : operationTime)}</div>
            {RenderState}
          </div>
        );
      }
    }

    const alreadyDisposeOrExamine = stateTab === TABS.COMPLETE && this.props.type !== 0;

    if (alreadyDisposeOrExamine) {
      const currentWorkFlowNode = _.isEmpty(currentWorkFlowNodes)
        ? {}
        : currentWorkFlowNodes[currentWorkFlowNodes.length - 1];
      if (status === 1) {
        RenderResultState = (
          <div className="state bold valignWrapper">
            <div className="Font13 Gray_75">
              {currentWorkFlowNodes && currentWorkFlowNodes.length > 1
                ? _l('%0个节点', currentWorkFlowNodes.length)
                : currentWorkFlowNode
                  ? currentWorkFlowNode.name
                  : flowNode.name}
            </div>
            <div className="info mLeft5 Gray_75 Font13">{_l('处理中…')}</div>
          </div>
        );
      } else {
        const instanceStatus = status === 3 || status === 4 ? (instanceLog ? instanceLog.status : status) : status;
        const { text, bg, shallowBg } = INSTANCELOG_STATUS[instanceStatus] || {};
        RenderResultState = (
          <div className="state bold valignWrapper" style={{ backgroundColor: shallowBg }}>
            <div className="Font13" style={{ color: bg }}>
              {text}
            </div>
          </div>
        );
      }
    }

    return (
      <div className="cardHeader valignWrapper">
        <div className="stateWrapper valignWrapper">
          {this.renderApp()}
          {RenderResultState}
          {!alreadyDisposeOrExamine && RenderState}
          {!alreadyDisposeOrExamine && this.renderTimeConsuming()}
          {this.renderSurplusTime()}
        </div>
        <div className="Red">{RenderRightHander}</div>
      </div>
    );
  }
  renderBody() {
    const { item, stateTab } = this.props;
    const { createAccount, app = {} } = item;

    return (
      <div className="cardBody flexColumn">
        <div className="flexRow conent">
          <div className="valignWrapper avatarWrapper mRight10">
            <UserHead
              className="accountAvatar"
              user={{
                userHead: createAccount.avatar,
                accountId: createAccount.accountId,
              }}
              size={22}
              appId={app.id}
              chatButton={false}
            />
            <span className="fullName Font13 pLeft5 pRight10">{createAccount.fullName}</span>
          </div>
          <span className="flex">{item.title || _l('未命名')}</span>
        </div>
        {stateTab === TABS.WAITING_EXAMINE ? (
          <span className="Gray_75 Font13 mTop8 overflow_ellipsis">{item.workItem.opinion}</span>
        ) : null}
      </div>
    );
  }
  renderTimeConsuming() {
    const { workItem = {} } = this.props.item;

    const workItems = (workItem.workId ? [workItem] : []).filter(
      item => _.includes([3, 4], item.type) && item.operationTime,
    );
    const timeConsuming = [];
    const endTimeConsuming = [];

    if (!workItems.length) return null;

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

    if (
      (workItems[0].opinion || '').indexOf('限时自动通过') > -1 ||
      (workItems[0].opinion || '').indexOf('限时自动填写') > -1
    ) {
      maxEndTimeConsuming = 1;
      autoPass = true;
    }

    if (!maxEndTimeConsuming) {
      const time = covertTime(maxTimeConsuming);
      return time ? <span className="Gray_75 mLeft10">{_l('耗时：%0', time)}</span> : null;
    }

    return (
      <Tooltip
        title={
          autoPass
            ? ''
            : maxEndTimeConsuming > 0
              ? _l('超时 %0 完成', covertTime(maxEndTimeConsuming))
              : _l('提前 %0 完成', covertTime(maxEndTimeConsuming))
        }
      >
        <span
          className="stepTimeConsuming flexRow"
          style={{
            color: maxEndTimeConsuming > 0 ? '#F44336' : '#4CAF50',
          }}
        >
          <Icon icon={maxEndTimeConsuming > 0 ? 'access_time' : 'task'} className="Font14 mRight2" />
          {_l('耗时：%0', covertTime(maxTimeConsuming))}
        </span>
      </Tooltip>
    );
  }
  renderSurplusTime() {
    const { workItem = {} } = this.props.item;
    let currentAccountNotified = false;
    const workItems = (workItem.workId ? [workItem] : []).filter(item => {
      if (item.executeTime) {
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
          color: time > 0 ? '#F44336' : currentAccountNotified ? '#FF9800' : '#1677ff',
        }}
      >
        <Icon icon={time > 0 ? 'error1' : 'hourglass'} className="Font14 mRight2" />
        {time > 0 ? _l('已超时%0', covertTime(time)) : _l('剩余%0', covertTime(time))}
      </span>
    );
  }
  renderApp() {
    const { item } = this.props;
    const { app, process } = item;
    return (
      <div className="valignWrapper flex overflowHidden mRight10">
        <div className="appIcon" style={{ backgroundColor: app.iconColor }}>
          <SvgIcon url={app.iconUrl} fill="#fff" size={18} addClassName="mTop2" />
        </div>
        <span className="Gray_75 bold ellipsis" style={{ maxWidth: 460 }}>
          {app.name}
          <span className="dot" />
          {process.name}
        </span>
      </div>
    );
  }
  renderTime() {
    const { item, stateTab, type } = this.props;
    const { createDate, workItem } = item;
    return (
      <div className="Gray_75">
        <div className="pLeft16 flexRow">
          {stateTab === TABS.MY_SPONSOR || (type === 0 && stateTab === TABS.COMPLETE) ? (
            <span>{createTimeSpan(dateConvertToUserZone(createDate))}</span>
          ) : (
            <span>{createTimeSpan(dateConvertToUserZone(workItem.receiveTime))}</span>
          )}
        </div>
      </div>
    );
  }
  renderCheckBox() {
    const { item, approveChecked, onAddApproveRecord, onRemoveApproveRecord } = this.props;
    const { batchApprove } = item.flowNode || {};
    const disabled = !batchApprove;
    return (
      <div
        className="mLeft10"
        onClick={event => {
          event.stopPropagation();
        }}
      >
        <Tooltip title={disabled ? _l('未开启批量审批，请单独操作') : null}>
          <Checkbox
            disabled={disabled}
            checked={approveChecked}
            onChange={() => {
              if (approveChecked) {
                onRemoveApproveRecord(item.workId);
              } else {
                onAddApproveRecord(item);
              }
            }}
          />
        </Tooltip>
      </div>
    );
  }
  renderControl(item) {
    const { controls } = this.props.item;
    return (
      <div key={item.controlId} className={cx('controlWrapper flexColumn mTop10', { flex: controls.length <= 1 })}>
        <div className="Gray_75 ellipsis">{item.controlName}</div>
        <div className="controlValue">{item.value || '--'}</div>
      </div>
    );
  }
  renderFooter() {
    const { controls } = this.props.item;
    return <div className="cardFooter flexRow Font13">{controls.map(item => this.renderControl(item))}</div>;
  }
  render() {
    const { onClick, approveChecked } = this.props;
    return (
      <div className="cardWrapper pointer" onClick={onClick}>
        {this.renderHeader()}
        {this.renderBody()}
        {this.renderFooter()}
        {approveChecked && <div className="approveChecked" />}
      </div>
    );
  }
}
