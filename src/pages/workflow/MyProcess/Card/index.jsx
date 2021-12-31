import React, { Fragment, Component } from 'react';
import cx from 'classnames';
import Icon from 'ming-ui/components/Icon';
import { TABS } from '../index';
import { Checkbox, Tooltip } from 'antd';
import { FLOW_FAIL_REASON } from 'src/pages/workflow/WorkflowSettings/History/config';
import { ACTION_TYPES, TYPE_TO_STYLE, FLOW_NODE_TYPE_STATUS, INSTANCELOG_STATUS } from '../config';
import './index.less';
import SvgIcon from 'src/components/SvgIcon';

export default class Card extends Component {
  constructor(props) {
    super(props);
  }
  componentDidMount() {
    const { createAccount } = this.props.item;
    $(this.avatar).mdBusinessCard({
      chatByLink: true,
      accountId: createAccount.accountId,
    });
  }
  renderHeader() {
    const { stateTab, item } = this.props;
    const { flowNode, workItem, flowNodeType, currentWorkFlowNodes, completeDate, instanceLog, status } = item;
    const type =
      ACTION_TYPES[
        stateTab === TABS.MY_SPONSOR && !_.isEmpty(currentWorkFlowNodes)
          ? currentWorkFlowNodes[currentWorkFlowNodes.length - 1].type
          : flowNodeType
      ];
    const { icon, bg } = TYPE_TO_STYLE[type.id];

    let RenderState = null;
    let RenderRightHander = null;

    if ([TABS.WAITING_APPROVE, TABS.WAITING_FILL, TABS.WAITING_EXAMINE].includes(stateTab)) {
      RenderState = (
        <div className="state bold valignWrapper">
          <div className="Font13 Gray_75">{flowNode.name}</div>
        </div>
      );
      RenderRightHander = (
        <div className="valignWrapper">
          {this.renderTime()}
          {stateTab === TABS.WAITING_APPROVE && this.renderCheckBox()}
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
            }}>
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
            {currentWorkFlowNode ? currentWorkFlowNode.name : flowNode.name}
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
        const { text, bg, icon } = INSTANCELOG_STATUS[instanceStatus];
        RenderState = (
          <Fragment>
            <div className="state bold valignWrapper" style={{ backgroundColor: bg }}>
              {icon ? <Icon icon={icon} className="mRight5" /> : null}
              <div className="Font13">{text}</div>
            </div>
            {(instanceLog && instanceLog.cause && instanceStatus !== 5) && (
              <div className="Font13 mLeft10 Gray_75">
                {`${instanceLog.cause === 40007 ? '' : _l('节点：')}${ FLOW_FAIL_REASON[instanceLog.cause] || instanceLog.causeMsg }`}
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
      RenderRightHander = (
        <div className="Gray_9e">{createTimeSpan(type === 0 ? completeDate : operationTime)}</div>
      );
    }

    return (
      <div className="cardHeader valignWrapper">
        <div className="stateWrapper valignWrapper">
          {this.renderApp()}
          {RenderState}
        </div>
        {RenderRightHander}
      </div>
    );
  }
  renderBody() {
    const { item, stateTab } = this.props;
    const { createAccount } = item;
    return (
      <div className="cardBody flexColumn">
        <div className="flexRow conent">
          <div className="valignWrapper avatarWrapper mRight10">
            <img
              className="accountAvatar"
              ref={(avatar) => {
                this.avatar = avatar;
              }}
              src={createAccount.avatar}
            />
            <span className="fullName Font13 pLeft5 pRight10">{createAccount.fullName}</span>
          </div>
          <span className="flex">{item.title || _l('未命名')}</span>
        </div>
        {stateTab === TABS.WAITING_EXAMINE ? (
          <span className="Gray_9e Font13 mTop8 overflow_ellipsis">{item.workItem.opinion}</span>
        ) : null}
      </div>
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
        <span className="Gray_75 bold ellipsis">
          {app.name}
          <span className="dot"></span>
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
            <span>{createTimeSpan(createDate)}</span>
          ) : (
            <span>{createTimeSpan(workItem.receiveTime)}</span>
          )}
        </div>
      </div>
    );
  }
  renderCheckBox() {
    const { item, approveChecked, onAddApproveRecord, onRemoveApproveRecord } = this.props;
    const { batchType } = item.flowNode || {};
    const disabled = [-1, -2].includes(batchType);
    return (
      <div
        className="mLeft10"
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        <Tooltip title={disabled ? _l('未开启批量审批或需要填写审批意见、必填项，请单独操作') : null}>
          <Checkbox
            disabled={disabled}
            checked={approveChecked}
            onChange={() => {
              if (approveChecked) {
                onRemoveApproveRecord(item.id);
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
    return (
      <div key={item.controlId} className="controlWrapper flexColumn mTop10">
        <div className="Gray_75">{item.controlName}</div>
        <div className="controlValue">{item.value || '--'}</div>
      </div>
    );
  }
  renderFooter() {
    const { controls } = this.props.item;
    return (
      <div className="cardFooter flexRow Font13">
        {controls.map(item => (
          this.renderControl(item)
        ))}
      </div>
    );
  }
  render() {
    const { onClick, approveChecked } = this.props;
    return (
      <div className="cardWrapper pointer" onClick={onClick}>
        {this.renderHeader()}
        {this.renderBody()}
        {this.renderFooter()}
        {approveChecked && <div className="approveChecked"></div>}
      </div>
    );
  }
}
