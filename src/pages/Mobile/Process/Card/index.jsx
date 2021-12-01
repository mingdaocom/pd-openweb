import React, { Fragment, Component } from 'react';
import { Icon, Button } from 'ming-ui';
import { FLOW_FAIL_REASON } from 'src/pages/workflow/WorkflowSettings/History/config';
import { FLOW_NODE_TYPE_STATUS, INSTANCELOG_STATUS } from 'src/pages/workflow/MyProcess/config';
import { ACTION_TO_METHOD } from 'src/pages/workflow/components/ExecDialog/config';
import './index.less';
import SvgIcon from 'src/components/SvgIcon';
import OtherAction from 'src/pages/Mobile/ProcessRecord/OtherAction';
import instanceVersion from 'src/pages/workflow/api/instanceVersion';
import instance from 'src/pages/workflow/api/instance';
import { processInformTabs } from 'src/pages/Mobile/Process/ProcessInform';

const TABS = {
  WAITING_DISPOSE: 1, // 待处理
  WAITING_EXAMINE: 2, // 待查看
  MY_SPONSOR: 3, // 我发起
  COMPLETE: 4, // 已完成
};

export default class Card extends Component {
  constructor(props) {
    super(props);
    this.state = {
      otherActionVisible: false,
      action: '',
      instance: null
    }
  }
  processInformTabs = processInformTabs.map(item => item.id)
  handleApprove = (event, action) => {
    const { item } = this.props;
    event.stopPropagation();
    instanceVersion.get({
      id: item.id,
      workId: item.workId,
    }).then(data => {
      this.setState({
        action,
        instance: data,
        otherActionVisible: true
      });
    });
  }
  handleAction = (action, content, forwardAccountId, backNodeId, signature) => {
    this.setState({ submitLoading: true, otherActionVisible: false });
    if (_.includes(['pass', 'overrule'], action)) {
      const { item, onApproveDone } = this.props;
      const data = { opinion: content, backNodeId, signature };
      instance[ACTION_TO_METHOD[action]]({
        id: item.id,
        workId: item.workId,
        ...data,
      }).then((data) => {
        if (data) {
          alert(_l('操作成功'));
          onApproveDone(item);
        }
      });
    }
  }
  renderHeader() {
    const { currentTab, item, time } = this.props;
    const { flowNode, workItem, flowNodeType, currentWorkFlowNodes, completeDate, instanceLog, status } = item;

    let RenderState = null;

    if (currentTab == 'completeMySponsor') {
      RenderState = this.renderInstanceStatu();
    } else if (currentTab == 'completeDispose') {
      RenderState = this.renderNodeState();
    } else {
      RenderState = (
        <div className="flowNode bold valignWrapper">
          <div className="Font12 Gray_75">{flowNode.name}</div>
        </div>
      );
    }

    return (
      <div className="mobileProcessCardHeader valignWrapper">
        <div className="stateWrapper valignWrapper flex">
          {RenderState}
        </div>
        <div className="Gray_9e ellipsis time">{time}</div>
      </div>
    );
  }
  renderInfo() {
    const { currentTab, item } = this.props;
    const { flowNode, flowNodeType, workItem } = item;
    const { passBatchType, overruleBatchType, btnMap } = flowNode;
    const { operationType } = workItem;
    if (currentTab === 'waitingApproval') {
      return (
        <div className="valignWrapper mLeft10 approveBtnWrapper">
          {passBatchType === -1 && (
            <Button
              className="backlog"
              type="ghostgray"
              size="small"
            >
              {_l('待办')}
            </Button>
          )}
          {passBatchType !== -1 && (
            <Button
              className="pass mRight5"
              type="ghostgray"
              size="small"
              onClick={(event) => {
                this.handleApprove(event, 'pass');
              }}
            >
              {btnMap[4] || _l('通过')}
            </Button>
          )}
          {overruleBatchType !== -1 && (
            <Button
              className="overrule"
              type="ghostgray"
              size="small"
              onClick={(event) => {
                this.handleApprove(event, 'overrule');
              }}
            >
              {btnMap[5] || _l('否决')}
            </Button>
          )}
        </div>
      );
    }
    if (currentTab === 'mySponsor') {
      return <div className="Font13 mLeft10 bold Gray_75">{_l('处理中…')}</div>;
    }
    if (['all', 'already', 'unread'].includes(currentTab)) {
      const { text, color } = FLOW_NODE_TYPE_STATUS[flowNodeType][operationType];
      const isAlready = flowNodeType === 5 && operationType === 1;
      return <div className="Font13 mLeft10 bold" style={{ color: isAlready ? '#9e9e9e' : color }}>{text}</div>;
    }
    return null;
  }
  renderNodeState() {
    const { item } = this.props;
    const { flowNodeType, workItem } = item;
    const { operationType } = workItem;
    const node = FLOW_NODE_TYPE_STATUS[flowNodeType][operationType];
    if (node) {
      const { text, color, shallowBg } = node;
      return (
        <div className="nodeState bold valignWrapper" style={{ color, backgroundColor: shallowBg, borderRadius: 3 }}>
          {text}
        </div>
      )
    } else {
      return null;
    }
  }
  renderInstanceStatu() {
    const { item } = this.props;
    const { workItem, instanceLog, status } = item;
    const instanceStatus = status === 3 || status === 4 ? instanceLog.status : status;
    const { text, bg, shallowBg, icon } = INSTANCELOG_STATUS[instanceStatus];
    return (
      <Fragment>
        <div className="nodeState bold valignWrapper" style={{ color: bg, backgroundColor: shallowBg }}>
          {icon ? <Icon icon={icon} className="mRight5" /> : null}
          <div className="Font13">{text}</div>
        </div>
      </Fragment>
    );
  }
  renderFooter() {
    const { item } = this.props;
    const { app, process } = item;
    return (
      <div className="mobileProcessCardFooter valignWrapper">
        <div className="stateWrapper valignWrapper flex overflow_ellipsis">
          <div className="appIcon" style={{ backgroundColor: app.iconColor }}>
            <SvgIcon url={app.iconUrl} fill="#fff" size={16} addClassName="mTop4" />
          </div>
          <div className="flexRow Gray_75 flex valignWrapper">
            <span className="appName overflow_ellipsis">
              {app.name}
            </span>
            <span className="processName overflow_ellipsis">
              <span className="dot"></span>
              {process.name}
            </span>
          </div>
        </div>
        {this.renderInfo()}
      </div>
    );
  }
  renderBody() {
    const { currentTab, item, renderBodyTitle } = this.props;
    const { createAccount, controls } = item;
    return (
      <div className="mobileProcessCardBody flexColumn">
        <div className="valignWrapper">
          <img className="accountAvatar" src={createAccount.avatar} />
          <span className="ellipsis">{renderBodyTitle()}</span>
        </div>
        {this.processInformTabs.includes(currentTab) && (
          <span className="Gray_9e Font13 mTop8 ellipsis">{item.workItem.opinion}</span>
        )}
        <div className="flexColumn mTop10">
          {controls.map(item => (
            <div key={item.controlId} className="Font12 flexRow mTop4">
              <div className="Gray_9e mRight10">{item.controlName}</div>
              <div className="flex overflow_ellipsis">{item.value || '--'}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  render() {
    const { otherActionVisible, action, instance } = this.state;
    const { onClick } = this.props;
    return (
      <Fragment>
        <div className="mobileProcessCardWrapper" onClick={onClick}>
          {this.renderHeader()}
          {this.renderBody()}
          {this.renderFooter()}
        </div>
        {otherActionVisible && (
          <OtherAction
            visible={otherActionVisible}
            action={action}
            selectedUser={_.object()}
            instance={instance}
            onAction={this.handleAction}
            onHide={() => {
              this.setState({
                otherActionVisible: false,
              });
            }}
          />
        )}
      </Fragment>
    );
  }
}
