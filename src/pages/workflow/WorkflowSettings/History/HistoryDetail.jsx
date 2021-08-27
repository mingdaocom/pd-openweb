import React, { Component, Fragment } from 'react';
import { string, func } from 'prop-types';
import cx from 'classnames';
import Icon from 'ming-ui/components/Icon';
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

export default class HistoryDetail extends Component {
  static propTypes = {
    id: string,
    onClick: func,
  };

  static defaultProps = {
    onClick: () => {},
  };

  state = {
    data: {},
  };

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
        <div className="personDetail flex Gray_75">
          {_.includes([3, 4, 5], type) && (
            <Fragment>
              <div className="personInfo">
                <span>{_l('%0人: ', NODE_TYPE[type].text)}</span>
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
            <span>{_l('会签: ')}</span>
            <span>{COUNTER_TYPE[countersignType]}</span>
            {names.some(item => item.action === 5) && <span className="overrule">{_l(', 审批被否决')}</span>}
          </div>
        ) : (
          names.map((item, key) => {
            if (item) {
              const { action, target } = item;
              if (!action) return <div key={key} />;
              return _.includes([2, 8, 16], action) ? (
                <div key={key} className="actionDetail flexRow Gray_75">
                  <div className="actionType">{_l('%0: ', ACTION_TYPE[action].text)}</div>
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

  render() {
    const { data } = this.state;
    if (_.isEmpty(data)) return null;

    const { onClick } = this.props;
    const { works, title, createDate } = data;
    const { status } = FLOW_STATUS[data.status];
    const { bgColor } = STATUS2COLOR[status];
    return (
      <div className="historyDetailWrap">
        <div className="header" onClick={onClick}>
          <Icon icon="backspace" className="Font20 Gray_9e" />
          <span className="backText Font15">{_l('返回')}</span>
        </div>
        <div className="detailContent">
          <div className={cx('itemInfo', status)} style={{ backgroundColor: bgColor }}>
            <HistoryStatus statusCode={data.status} size={44} />
            <div className="title Font18 flex overflow_ellipsis">{title}</div>
            <div className="time Font15 Gray_75">{createDate}</div>
          </div>
          <div className="logWrap">
            <div className="logTitle Font16 Gray_75">{_l('日志')}</div>
            <ul className="logList">
              {works.map((item, index) => {
                const { flowNode, startDate, endDate, status } = item;
                const { name } = flowNode;
                const { type } = NODE_TYPE[flowNode.child && flowNode.type === 0 ? 16 : flowNode.type] || {};
                return (
                  <li key={index}>
                    <HistoryStatus className="flowItemHistory" config={NODE_STATUS} statusCode={status} />
                    <div className="originNode ">
                      <NodeIcon type={type} appType={flowNode.appType} actionId={flowNode.actionId} />
                      <div className="nodeName Font15 overflow_ellipsis">{name}</div>
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
            </ul>
          </div>
        </div>
      </div>
    );
  }
}
