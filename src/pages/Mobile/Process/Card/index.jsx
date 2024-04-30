import React, { Fragment, Component } from 'react';
import { Icon, Button, SvgIcon } from 'ming-ui';
import cx from 'classnames';
import { Checkbox } from 'antd-mobile';
import { FLOW_FAIL_REASON } from 'src/pages/workflow/WorkflowSettings/History/config';
import { covertTime, FLOW_NODE_TYPE_STATUS, INSTANCELOG_STATUS } from 'src/pages/workflow/MyProcess/config';
import { ACTION_TO_METHOD } from 'src/pages/workflow/components/ExecDialog/config';
import './index.less';
import OtherAction from 'mobile/ProcessRecord/OtherAction';
import instanceVersion from 'src/pages/workflow/api/instanceVersion';
import instance from 'src/pages/workflow/api/instance';
import { processInformTabs } from 'mobile/Process/ProcessInform';
import _ from 'lodash';
import moment from 'moment';

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
      instance: null,
    };
  }
  processInformTabs = processInformTabs.map(item => item.id);
  handleApprove = (event, action) => {
    const { item } = this.props;
    event.stopPropagation();
    instanceVersion
      .get({
        id: item.id,
        workId: item.workId,
      })
      .then(data => {
        this.setState({
          action,
          instance: data,
          otherActionVisible: true,
        });
      });
  };
  handleAction = ({ action, content, forwardAccountId, backNodeId, signature, files }) => {
    this.setState({ submitLoading: true, otherActionVisible: false });
    if (_.includes(['pass', 'overrule'], action)) {
      const { item, onApproveDone } = this.props;
      const data = { opinion: content, backNodeId, signature, files };
      instance[ACTION_TO_METHOD[action]]({
        id: item.id,
        workId: item.workId,
        ...data,
      }).then(data => {
        if (data) {
          alert(_l('操作成功'));
          onApproveDone(item);
        }
        if (_.get(window, 'JSBridgeAdapter.approvalEvent')) {
          window.JSBridgeAdapter.approvalEvent({
            type: action === 'pass' ? 1 : 2,
            enterType: 1,
            result: data,
            workData: this.props.item
          });
        }
      });
    }
  };
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

    if (
      (workItems[0].opinion || '').indexOf('限时自动通过') > -1 ||
      (workItems[0].opinion || '').indexOf('限时自动填写') > -1
    ) {
      maxEndTimeConsuming = 1;
    }

    if (!maxEndTimeConsuming) {
      const time = covertTime(maxTimeConsuming);
      return time ? <span className="overflow_ellipsis Gray_9e mLeft10">{_l('耗时：%0', time)}</span> : null;
    }

    return (
      <span
        className="stepTimeConsuming flexRow"
        style={{
          color: maxEndTimeConsuming > 0 ? '#F44336' : '#4CAF50',
        }}
      >
        <Icon icon={maxEndTimeConsuming > 0 ? 'overdue_network' : 'task'} className="Font14 mRight2" />
        <div className="overflow_ellipsis">{_l('耗时：%0', covertTime(maxTimeConsuming))}</div>
      </span>
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
          color: time > 0 ? '#F44336' : currentAccountNotified ? '#FF9800' : '#2196f3',
        }}
      >
        <Icon icon={time > 0 ? 'error1' : 'hourglass'} className="Font14 mRight2" />
        <div className="overflow_ellipsis">
          {time > 0 ? _l('已超时%0', covertTime(time)) : _l('剩余%0', covertTime(time))}
        </div>
      </span>
    );
  }
  renderTime() {
    const { workItem = {} } = this.props.item;
    const consumingWorkItems = (workItem.workId ? [workItem] : []).filter(
      item => _.includes([3, 4], item.type) && item.operationTime,
    );
    const surplusTimeWorkItems = (workItem.workId ? [workItem] : []).filter(item => {
      return _.includes([3, 4], item.type) && !item.operationTime && item.dueTime;
    });

    if (consumingWorkItems.length) {
      return this.renderTimeConsuming();
    }
    if (surplusTimeWorkItems.length) {
      return this.renderSurplusTime();
    }

    return <div className="Gray_9e ellipsis time">{this.props.time}</div>;
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
      <div className="mobileProcessCardHeader valignWrapper overflow_ellipsis">
        <div className="stateWrapper valignWrapper flex">{RenderState}</div>
        {this.renderTime()}
      </div>
    );
  }
  renderInfo() {
    const { currentTab, item, batchApproval } = this.props;
    const { flowNode, flowNodeType, workItem } = item;
    const { batch, btnMap } = flowNode;
    const { operationType } = workItem;
    if (currentTab === 'waitingApproval') {
      if (batchApproval) {
        return null;
      }
      return (
        <div className="valignWrapper mLeft10 approveBtnWrapper">
          {!batch && (
            <Button className="backlog" type="ghostgray" size="small">
              {_l('办理')}
            </Button>
          )}
          {batch && (
            <Button
              className="ellipsis pass mRight5"
              type="ghostgray"
              size="small"
              onClick={event => {
                this.handleApprove(event, 'pass');
              }}
            >
              {btnMap[4] || _l('通过')}
            </Button>
          )}
          {batch && btnMap[5] && (
            <Button
              className="ellipsis overrule"
              type="ghostgray"
              size="small"
              onClick={event => {
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
      return (
        <div className="Font13 mLeft10 bold" style={{ color: isAlready ? '#9e9e9e' : color }}>
          {text}
        </div>
      );
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
      );
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
            <span className="appName overflow_ellipsis">{app.name}</span>
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
    const {
      item,
      approveChecked,
      onClick,
      onChangeApproveCards = _.noop,
      batchApproval,
      showApproveChecked = true,
    } = this.props;
    const { batch } = item.flowNode || {};
    const disabled = !batch;
    return (
      <Fragment>
        <div className={cx('mobileProcessCardWrapper flexRow', { batchApproval, approveChecked })}>
          {batchApproval && showApproveChecked && (
            <Checkbox
              className="mRight5"
              disabled={disabled}
              checked={approveChecked}
              onChange={onChangeApproveCards}
            />
          )}
          <div
            className="mobileProcessCardContent flexColumn flex"
            onClick={() => {
              if (batchApproval) {
                !disabled && onChangeApproveCards({ target: { checked: !approveChecked } });
              } else {
                onClick();
              }
            }}
          >
            {this.renderHeader()}
            {this.renderBody()}
            {this.renderFooter()}
          </div>
        </div>
        {otherActionVisible && (
          <OtherAction
            visible={otherActionVisible}
            action={action}
            selectedUser={{}}
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
