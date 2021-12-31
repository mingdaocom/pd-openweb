import React, { Component, Fragment } from 'react';
import { string, func, bool } from 'prop-types';
import cx from 'classnames';
import { Icon, LoadDiv } from 'ming-ui';
import HistoryStatus from './HistoryStatus';
import NodeIcon from './NodeIcon';
import api from '../../api/instance';
import {
  FLOW_STATUS,
  NODE_STATUS,
  FLOW_FAIL_REASON,
  STATUS2COLOR,
  NODE_TYPE,
  ACTION_TYPE,
  COUNTER_TYPE,
} from './config';
import { resetInstance } from '../../api/instanceVersion';

export default class HistoryDetail extends Component {
  static propTypes = {
    id: string,
    disabled: bool,
    onClick: func,
  };

  static defaultProps = {
    onClick: () => {},
  };

  state = {
    data: {},
    isRetry: false,
  };

  retryPosition = '';

  componentWillMount() {
    this.getData();
  }

  getData = () => {
    const { id } = this.props;
    id &&
      api.getHistoryDetail({ instanceId: id }).then(data => {
        this.setState({ data });
      });
  };

  renderOperationInfo = item => {
    const { cause, causeMsg } = this.state.data.instanceLog;
    const { flowNode, workItems, countersign, countersignType, status, log = {}, sourceId } = item;

    if (!sourceId && log.executeType === 2) {
      return <div className="Gray_75">{_l('跳过')}</div>;
    }

    const { type } = flowNode;
    const names = workItems.map(item => {
      const { workItemAccount, workItemLog } = item;
      if (workItemLog && workItemAccount) {
        return { name: workItemAccount.fullName, action: workItemLog.action, target: workItemLog.actionTargetName };
      }
      if (workItemAccount) {
        return { name: workItemAccount.fullName };
      }
    });

    return (
      <Fragment>
        <div className="personDetail flex Gray_75 flexRow">
          {_.includes([3, 4, 5], type) && (
            <Fragment>
              <div className="personInfo">
                <span>{_l('%0人：', NODE_TYPE[type].text)}</span>
                {names.map(
                  (item, index) =>
                    item && (
                      <span className={cx({ overrule: item.action === 5 })} key={index}>
                        {item.name}
                        {index < names.length - 1 && '、'}
                      </span>
                    ),
                )}
              </div>
              {_.includes([4, 5], status) && !countersign && (
                <div className={NODE_STATUS[status].status}>{FLOW_FAIL_REASON[cause] || causeMsg}</div>
              )}
            </Fragment>
          )}
        </div>
        {countersign && _.includes([1, 2], countersignType) ? (
          <div className="info">
            <span>{_l('会签：')}</span>
            <span>{COUNTER_TYPE[countersignType]}</span>
            {names.some(item => item && item.action === 5) && <span className="overrule">{_l(', 审批被否决')}</span>}
          </div>
        ) : (
          names.map((item, key) => {
            if (item) {
              const { action, target } = item;
              if (!action) return <div key={key} />;
              return _.includes([2, 8, 16], action) ? (
                <div key={key} className="actionDetail flexRow Gray_75">
                  <div className="actionType">{_l('%0：', ACTION_TYPE[action].text)}</div>
                  {target && <div className="actionTarget">{target}</div>}
                </div>
              ) : (
                <div key={key} />
              );
            }
          })
        )}
      </Fragment>
    );
  };

  renderSubProcess(item) {
    if (!item.flowNode.subProcessId) return null;

    return (
      <span
        className="ThemeColor3 ThemeHoverColor2 pointer"
        onClick={() => window.open(`/workflowedit/${item.flowNode.subProcessId}/2/${item.workId}_${item.instanceId}`)}
      >
        {_l('查看详情')}
      </span>
    );
  }

  renderRetryBtn(retryPosition) {
    const { disabled } = this.props;
    const { data, isRetry } = this.state;
    const { instanceLog, logs } = data;
    const { cause } = instanceLog;

    if (((data.status === 3 && _.includes([20001, 20002], cause)) || data.status === 4) && !disabled) {
      return (
        <div
          className={cx(
            'historyDetailRetry',
            isRetry ? 'historyDetailRetryDisabled' : 'ThemeHoverColor2 ThemeHoverBorderColor2',
          )}
          data-tip={_l('从失败或中止的节点处开始重试')}
          onClick={e => {
            this.retryPosition = retryPosition;
            this.resetInstance(e);
          }}
        >
          <Icon className="Font14 mRight3" icon="refresh1" />
          {_l('重试')}
          {!!logs.length && '#' + logs.length}
        </div>
      );
    }

    return null;
  }

  resetInstance = e => {
    const { isRetry } = this.state;
    const { id } = this.props;

    e.stopPropagation();

    if (isRetry) return;

    this.setState({ isRetry: true });

    resetInstance({ instanceId: id }).then(data => {
      this.setState({ data, isRetry: false });
    });
  };

  render() {
    const { data, isRetry } = this.state;
    if (_.isEmpty(data)) return <LoadDiv />;

    const { onClick } = this.props;
    const { works, title, createDate, instanceLog, completeType } = data;
    const { cause, nodeName, causeMsg } = instanceLog;
    const { status } = FLOW_STATUS[data.status];
    const { color, bgColor } = STATUS2COLOR[status];

    return (
      <div className="historyDetailWrap">
        <div className="header" onClick={onClick}>
          <Icon icon="backspace" className="Font20 Gray_9e" />
          <span className="backText Font15">{_l('返回')}</span>
        </div>
        <div className="detailContent">
          <div className={cx('itemInfo', status)} style={{ backgroundColor: bgColor }}>
            {isRetry && this.retryPosition === 'header' && <div className="workflowRetryLoading" />}
            <HistoryStatus statusCode={data.status} size={44} color={color} textSize={18} />
            <div className="title flex mRight15">
              <div className="overflow_ellipsis Font18">{_l('数据：') + title}</div>
              <div style={{ color }}>
                {cause
                  ? cause === 40007
                    ? FLOW_FAIL_REASON[cause]
                    : `${_l('节点: ')} ${nodeName}, ${FLOW_FAIL_REASON[cause] || causeMsg}`
                  : ''}
              </div>
            </div>
            <div className="time">
              <div className="Font15 Gray_75">{createDate}</div>
              {this.renderRetryBtn('header')}
            </div>
          </div>
          <div className="logWrap">
            <div className="logTitle Font16 Gray_75">{_l('日志')}</div>
            <ul className="logList">
              {works.map((item, index) => {
                const { flowNode, startDate, endDate, status, logs, multipleLevelType, sort } = item;
                const { name, alias } = flowNode;
                const { type } = NODE_TYPE[flowNode.child && flowNode.type === 0 ? 16 : flowNode.type] || {};

                return (
                  <li key={index}>
                    {isRetry && index === works.length - 1 && this.retryPosition === 'list' && (
                      <div className="workflowRetryLoading" />
                    )}

                    <div className="flowItemHistory flexRow">
                      <HistoryStatus config={NODE_STATUS} statusCode={status} />
                      {index !== works.length - 1 && !!(logs || []).length && (
                        <span className="mLeft8">
                          <div className="historyDetailRetryResult">{_l('重试') + '#' + logs.length}</div>
                        </span>
                      )}
                      {index === works.length - 1 && <span className="mLeft8">{this.renderRetryBtn('list')}</span>}
                    </div>

                    <div className="originNode">
                      <NodeIcon type={type} appType={flowNode.appType} actionId={flowNode.actionId} />
                      <div className="nodeName Font15 overflow_ellipsis flexColumn">
                        <div>
                          {name}
                          {multipleLevelType !== 0 && sort && _l('（第%0级）', sort)}
                        </div>
                        {alias && <div className="Gray_75 Font13 ellipsis">{_l('别名：%0', alias)}</div>}
                      </div>
                    </div>

                    <div className="operationPerson">
                      {flowNode.type === 16 ? this.renderSubProcess(item) : this.renderOperationInfo(item)}
                    </div>

                    <div className="operationTime Gray_75">
                      <div className="enterTime">{`${_l('进入:')} ${moment(startDate).format(
                        'YYYY-MM-DD HH:mm:ss',
                      )}`}</div>
                      {endDate && (
                        <div className="leaveTime">{`${_l('离开:')} ${moment(endDate).format(
                          'YYYY-MM-DD HH:mm:ss',
                        )}`}</div>
                      )}
                    </div>
                  </li>
                );
              })}

              {completeType === 1 && (
                <li className="pBottom0 pTop25">
                  <div className="TxtCenter Gray_9e w100">{_l('流程已结束')}</div>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    );
  }
}
