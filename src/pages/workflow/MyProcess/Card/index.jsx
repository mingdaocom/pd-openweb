import React, { Fragment, Component } from 'react';
import Icon from 'ming-ui/components/Icon';
import { TABS } from '../index';
import { FLOW_FAIL_REASON } from 'src/pages/workflow/WorkflowSettings/History/config';
import { ACTION_TYPES, TYPE_TO_STYLE, FLOW_NODE_TYPE_STATUS, INSTANCELOG_STATUS } from '../config';
import './index.less';
import SvgIcon from 'src/components/SvgIcon';

export default class Card extends Component {
  renderHeader() {
    const { stateTab, item } = this.props;
    const { flowNode, workItem, flowNodeType, currentWorkFlowNodes, completeDate, instanceLog, status } = item;
    const type =
      ACTION_TYPES[
        stateTab === TABS.MY_SPONSOR && !_.isEmpty(currentWorkFlowNodes)
          ? currentWorkFlowNodes[currentWorkFlowNodes.length - 1].type
          : flowNodeType
      ];
    const { icon, bg, shallowBg } = TYPE_TO_STYLE[type.id];

    let RenderState = null;
    let RenderRightHander = null;
    let RenderInfo = null;

    if (stateTab === TABS.WAITING_DISPOSE || stateTab === TABS.WAITING_EXAMINE) {
      RenderState = (
        <div className="state bold valignWrapper" style={{ backgroundColor: bg }}>
          <Icon icon={icon} className="mRight5" />
          <div className="Font13">{flowNode.name}</div>
        </div>
      );
    }
    if (stateTab === TABS.WAITING_EXAMINE) {
      RenderRightHander = (
        <div
          className="alreadyRead"
          onClick={event => {
            event.stopPropagation();
            this.props.onAlreadyRead(item);
          }}>
          <Icon icon="ok" />
          <span className="mLeft5">{_l('已读')}</span>
        </div>
      );
    }
    if (stateTab === TABS.MY_SPONSOR && currentWorkFlowNodes && currentWorkFlowNodes.length) {
      const currentWorkFlowNode = currentWorkFlowNodes[currentWorkFlowNodes.length - 1];
      RenderState = (
        <div className="state bold valignWrapper" style={{ backgroundColor: shallowBg }}>
          <Icon style={{ color: bg }} icon={icon} className="mRight5" />
          <div style={{ color: bg }} className="Font13">
            {currentWorkFlowNode ? currentWorkFlowNode.name : flowNode.name}
          </div>
        </div>
      );
      RenderInfo = <div className="info mLeft10 Gray_75 Font13">{_l('处理中…')}</div>;
    }
    if (stateTab === TABS.COMPLETE) {
      const { type } = this.props;
      const { operationType, operationTime } = workItem;
      if (type === 0) {
        const instanceStatus = status === 3 || status === 4 ? instanceLog.status : status;
        const { text, bg, icon } = INSTANCELOG_STATUS[instanceStatus];
        RenderState = (
          <Fragment>
            <div className="state bold valignWrapper" style={{ backgroundColor: bg }}>
              {icon ? <Icon icon={icon} className="mRight5" /> : null}
              <div className="Font13">{text}</div>
            </div>
            {instanceLog && instanceLog.cause && instanceStatus !== 5 ? (
              <div className="Font13 mLeft10 Gray_75">{`${instanceLog.cause === 40007 ? '' : _l('节点：')}${
                FLOW_FAIL_REASON[instanceLog.cause]
              }`}</div>
            ) : null}
          </Fragment>
        );
      } else {
        if (FLOW_NODE_TYPE_STATUS[flowNodeType][operationType]) {
          const { text, color } = FLOW_NODE_TYPE_STATUS[flowNodeType][operationType];
          RenderInfo = (
            <div className="Font13 mLeft10 bold" style={{ color }}>
              {text}
            </div>
          );
        }
        RenderState = (
          <div className="state bold valignWrapper" style={{ color: '#9E9E9E' }}>
            <Icon icon={icon} className="mRight5" />
            <div className="Font13">{flowNode.name}</div>
          </div>
        );
      }
      RenderRightHander = (
        <div className="Gray_9e">{createTimeSpan(type === 0 ? completeDate : operationTime)}</div>
      );
    }

    return (
      <div className="cardHeader valignWrapper">
        <div className="stateWrapper valignWrapper">
          {RenderState}
          {RenderInfo}
        </div>
        {RenderRightHander}
      </div>
    );
  }
  renderBody() {
    const { item, stateTab } = this.props;
    return (
      <div className="cardBody flexColumn">
        <span>{item.title || _l('未命名')}</span>
        {stateTab === TABS.WAITING_EXAMINE ? (
          <span className="Gray_9e Font13 mTop8 overflow_ellipsis">{item.workItem.opinion}</span>
        ) : null}
      </div>
    );
  }
  renderFooter() {
    const { item, stateTab, type } = this.props;
    const { app, createDate, process, createAccount, workItem } = item;
    return (
      <div className="cardFooter valignWrapper Font13">
        <div className="valignWrapper flex overflowHidden">
          <div className="appIcon" style={{ backgroundColor: app.iconColor }}>
            <SvgIcon url={app.iconUrl} fill="#fff" size={18} addClassName="mTop2" />
          </div>
          <span className="Gray_75 ellipsis">
            {app.name}
            <span className="dot"></span>
            {process.name}
          </span>
        </div>
        <div className="user valignWrapper flex Gray_75 overflow_ellipsis">
          <div className="pLeft16 flexRow overflow_ellipsis">
            <div>{_l('发起人')}</div>
            <img src={createAccount.avatar} />
            <div className="ellipsis">{createAccount.fullName}</div>
          </div>
        </div>
        <div className="Gray_75 flex">
          <div className="pLeft16 flexRow">
            {stateTab === TABS.MY_SPONSOR || (type === 0 && stateTab === TABS.COMPLETE) ? (
              <Fragment>
                <span className="mRight15">{_l('发起时间')}</span>
                <span>{createTimeSpan(createDate)}</span>
              </Fragment>
            ) : (
              <Fragment>
                <span className="mRight15">{_l('接收时间')}</span>
                <span>{createTimeSpan(workItem.receiveTime)}</span>
              </Fragment>
            )}
          </div>
        </div>
      </div>
    );
  }
  render() {
    const { onClick } = this.props;
    return (
      <div className="cardWrapper pointer" onClick={onClick}>
        {this.renderHeader()}
        {this.renderBody()}
        {this.renderFooter()}
      </div>
    );
  }
}
