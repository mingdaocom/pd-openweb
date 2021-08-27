import React, { Fragment, Component } from 'react';
import Icon from 'ming-ui/components/Icon';
import { FLOW_FAIL_REASON } from 'src/pages/workflow/WorkflowSettings/History/config';
import {
  ACTION_TYPES,
  TYPE_TO_STYLE,
  FLOW_NODE_TYPE_STATUS,
  INSTANCELOG_STATUS,
} from 'src/pages/workflow/MyProcess/config';
import './index.less';
import SvgIcon from 'src/components/SvgIcon';

const TABS = {
  WAITING_DISPOSE: 1, // 待处理
  WAITING_EXAMINE: 2, // 待查看
  MY_SPONSOR: 3, // 我发起
  COMPLETE: 4, // 已完成
};

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
        <div className="state bold valignWrapper maxWidth" style={{ backgroundColor: bg }}>
          <Icon icon={icon} className="mRight5" />
          <div className="Font13 overflow_ellipsis">{flowNode.name}</div>
        </div>
      );
      RenderRightHander = <div className="Gray_9e">{createTimeSpan(workItem.receiveTime)}</div>;
    }
    if (stateTab === TABS.WAITING_EXAMINE) {
      RenderRightHander = <span className="Gray_75">{createTimeSpan(workItem.receiveTime)}</span>;
    }
    if (stateTab === TABS.MY_SPONSOR) {
      const currentWorkFlowNode = currentWorkFlowNodes[currentWorkFlowNodes.length - 1];
      RenderState = (
        <div className="state bold valignWrapper" style={{ backgroundColor: shallowBg }}>
          <Icon style={{ color: bg }} icon={icon} className="mRight5" />
          <div style={{ color: bg }} className="Font13 overflow_ellipsis">
            {currentWorkFlowNode ? currentWorkFlowNode.name : flowNode.name}
          </div>
        </div>
      );
      RenderInfo = <div className="info mLeft10 Gray_75 Font13">{_l('处理中…')}</div>;
      RenderRightHander = <div className="Gray_9e">{createTimeSpan(item.createDate)}</div>;
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
              <div className="Font13 overflow_ellipsis">{text}</div>
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
            <div className="Font13 overflow_ellipsis">{flowNode.name}</div>
          </div>
        );
      }
      RenderRightHander = (
        <div className="Gray_9e">{createTimeSpan(type === 0 ? completeDate : operationTime)}</div>
      );
    }

    return (
      <div className="mobileProcessCardHeader valignWrapper">
        <div className="stateWrapper valignWrapper flex">
          {RenderState}
          {RenderInfo}
        </div>
        {RenderRightHander}
      </div>
    );
  }
  renderInfo() {
    const { currentTab, item } = this.props;
    if (currentTab === 'untreated') {
      return <div className="state">{`${_l('等待')}${item.flowNode.name}`}</div>;
    } else {
      const { flowNodeType, workItem } = item;
      const { operationType } = workItem;
      const { text, color } = FLOW_NODE_TYPE_STATUS[flowNodeType][operationType];
      if (FLOW_NODE_TYPE_STATUS[flowNodeType][operationType]) {
        return (
          <div className="Font13 mLeft10 bold" style={{ color }}>
            {text}
          </div>
        );
      }
    }
    return null;
  }
  renderHeader2() {
    const { item, time } = this.props;
    const { app } = item;
    return (
      <div className="mobileProcessCardHeader valignWrapper">
        <div className="stateWrapper valignWrapper flex">
          <div className="appIcon" style={{ backgroundColor: app.iconColor }}>
            <SvgIcon url={app.iconUrl} fill="#fff" size={16} addClassName="mTop4" />
          </div>
          <div className="flexRow flex ellipsis valignWrapper">
            <span className="Gray_75 ellipsis">{app.name}</span>
            <div className="Gray_9e ellipsis time">{time}</div>
          </div>
        </div>
        {this.renderInfo()}
      </div>
    );
  }
  renderBody() {
    const { renderBodyTitle } = this.props;
    return (
      <div className="mobileProcessCardBody flexColumn">
        <span>{renderBodyTitle()}</span>
      </div>
    );
  }
  renderFooter() {
    const { item, stateTab, type } = this.props;
    const { app, createDate, process, createAccount, workItem } = item;
    return (
      <div className="mobileProcessCardFooter valignWrapper Font13">
        <div className="valignWrapper flex overflowHidden">
          <div className="appIcon" style={{ backgroundColor: app.iconColor }}>
            <SvgIcon url={app.iconUrl} fill="#fff" size={16} addClassName="mTop4" />
          </div>
          <span className="Gray_75 ellipsis">
            {app.name}
            <span className="dot"></span>
            {process.name}
          </span>
        </div>
        {stateTab === TABS.WAITING_EXAMINE ? (
          <div
            className="Gray_75 alreadyRead"
            onClick={event => {
              event.stopPropagation();
              this.props.onAlreadyRead(item);
            }}>
            <Icon icon="ok" />
            <span className="mLeft5">{_l('已读')}</span>
          </div>
        ) : null}
      </div>
    );
  }
  render() {
    const { onClick } = this.props;
    return (
      <div className="mobileProcessCardWrapper" onClick={onClick}>
        {this.renderHeader2()}
        {this.renderBody()}
        {/*this.renderFooter()*/}
      </div>
    );
  }
}
