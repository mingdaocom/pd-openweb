import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import moment from 'moment';
import { func, string } from 'prop-types';
import { Icon, LoadDiv } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import api from '../../api/instance';
import instanceVersion from '../../api/instanceVersion';
import process from '../../api/process';
import { APP_TYPE, OPERATION_TYPE } from '../enum';
import HistoryStatus from './components/HistoryStatus';
import logDialog from './components/logDialog';
import NodeIcon from './components/NodeIcon';
import {
  ACTION_TYPE,
  COUNTER_TYPE,
  FLOW_FAIL_REASON,
  FLOW_STATUS,
  NODE_STATUS,
  NODE_TYPE,
  STATUS2COLOR,
} from './config';

export default class HistoryDetail extends Component {
  static propTypes = {
    id: string,
    onClick: func,
    openNodeDetail: func,
  };

  static defaultProps = {
    onClick: () => {},
    openNodeDetail: () => {},
  };

  state = {
    data: {},
    isRetry: false,
    processInfo: {},
  };

  retryPosition = '';

  componentWillMount() {
    this.getData();
    this.getProcessPublish();
  }

  getData = () => {
    const { id } = this.props;

    id &&
      api
        .getHistoryDetail({ instanceId: id }, { isIntegration: location.href.indexOf('integration') > -1 })
        .then(data => {
          data.works = this.sortWorks(data.works);
          this.setState({ data });
        });
  };

  sortWorks = works => {
    const gateways = works.filter(o => o.flowNode.type === 1 && o.flowNode.flowIds && o.flowNode.flowIds.length);

    gateways.forEach(item => {
      const flowId = item.flowNode.flowIds[0];
      const id = item.flowNode.id;
      const currentIndex = _.findIndex(works, o => _.includes(o.flowNode.flowIds, flowId));
      const index = _.findIndex(works, o => _.includes([flowId, id], o.flowNode.prveId));

      if (currentIndex !== index && index !== -1) {
        works = works.filter((o, i) => i !== currentIndex);
        works.splice(index - (currentIndex < index ? 1 : 0), 0, item);
      }
    });

    return works;
  };

  getProcessPublish = () => {
    const { id } = this.props;

    process.getProcessPublish({ instanceId: id }).then(res => {
      this.setState({ processInfo: res });
    });
  };

  renderOperationInfo = (item, isLast) => {
    const { cause, causeMsg, causeAccount } = this.state.data.instanceLog;
    const {
      flowNode,
      workItems,
      countersign,
      countersignType,
      status,
      log = {},
      sourceId,
      scheduleActions,
      updateLogs,
      updateWorks,
    } = item;

    if (!sourceId && log.executeType === 2) {
      return <div className="Gray_75">{_l('跳过')}</div>;
    }

    if (cause === 7777 && status === 3 && causeAccount) {
      return <div className="personDetail flex Gray_75 flexRow">{_l('管理员：%0 中止', causeAccount.fullName)}</div>;
    }

    const { type, appType } = flowNode;
    const names = workItems.map(item => {
      const { workItemAccount, workItemLog } = item;
      if (workItemLog && workItemAccount) {
        return { name: workItemAccount.fullName, action: workItemLog.action, target: workItemLog.actionTargetName };
      }
      if (workItemAccount) {
        return {
          name:
            type === 0 && workItemAccount.accountId === 'user-undefined' ? _l('发起人为空') : workItemAccount.fullName,
        };
      }
    });

    const isApproval = appType === 9 && type === 0;
    const ERROR_LABELS = {
      102: _l('发送邮件，'),
    };

    return (
      <Fragment>
        {updateLogs &&
          Object.keys(updateLogs).map(key => (
            <div key={key} className="overrule mBottom12">
              {ERROR_LABELS[key]}
              {FLOW_FAIL_REASON[updateLogs[key].cause] || updateLogs[key].causeMsg}
            </div>
          ))}

        {!!(updateWorks || {})[OPERATION_TYPE.BEFORE] && (
          <div className="breakAll mBottom12 Gray_75">{_l('审批前更新了记录')}</div>
        )}

        {countersign && _.includes([1, 2, 4], countersignType) && (
          <div className="breakAll mBottom12 Gray_75">
            <span>{_l('开始审批')}</span>
            <span>(</span>
            <span>{_l('会签：')}</span>
            <span>{COUNTER_TYPE[countersignType]}</span>
            <span>)</span>
          </div>
        )}

        <div className="personDetail flex Gray_75 flexRow">
          {(_.includes([0, 3, 4, 5, 27], type) || isApproval) && (
            <Fragment>
              <div className="personInfo inlineFlexRow">
                <span>
                  {isApproval ? _l('发起人：') : type === 0 ? _l('触发者：') : _l('%0人：', NODE_TYPE[type].text)}
                </span>
                {names.map(
                  (item, index) =>
                    item && (
                      <span className={cx({ overrule: item.action === 5 })} key={index}>
                        {item.name}
                        {index < names.length - 1 && '、'}
                      </span>
                    ),
                )}

                {scheduleActions && !!scheduleActions.length && (
                  <div>
                    <span>{_l('提醒人：')}</span>
                    {scheduleActions.map((item, i) =>
                      item.accounts.map((obj, j) => (
                        <Fragment key={`${i}-${j}`}>
                          <span>{obj.fullName}</span>
                          <span className="Gray_75">({moment(item.executeTime).format('MM-DD HH:mm')})</span>
                          {(i !== scheduleActions.length - 1 || j !== item.accounts.length - 1) && <span>、</span>}
                        </Fragment>
                      )),
                    )}
                  </div>
                )}
              </div>
              {_.includes([4, 5], status) && !countersign && isLast && (
                <div className={NODE_STATUS[status].status}>
                  {cause === 7777 && flowNode.name ? _l('过期自动中止') : FLOW_FAIL_REASON[cause] || causeMsg}
                </div>
              )}
            </Fragment>
          )}
        </div>

        {!countersign ||
          (!_.includes([1, 2, 4], countersignType) &&
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
            }))}

        {!!updateWorks && (
          <Fragment>
            {!!updateWorks[OPERATION_TYPE.PASS] && <div className="info Gray_75">{_l('通过后更新了记录')}</div>}
            {!!updateWorks[OPERATION_TYPE.OVERRULE] && <div className="info Gray_75">{_l('否决后更新了记录')}</div>}
            {!!updateWorks[OPERATION_TYPE.RETURN] && <div className="info Gray_75">{_l('退回后更新了记录')}</div>}
            {!!updateWorks[OPERATION_TYPE.ADD_OPERATION] && (
              <div className="info Gray_75">{_l('新增节点操作明细')}</div>
            )}
          </Fragment>
        )}
      </Fragment>
    );
  };

  renderSubProcess(item) {
    const { isPlugin } = this.props;

    if (!item.flowNode.subProcessId) return null;

    return (
      <Fragment>
        <span className="Gray_75 mRight10">{_l('%0 行记录', item.sort)}</span>
        <span
          className="ThemeColor3 ThemeHoverColor2 pointer"
          onClick={() =>
            window.open(
              `${isPlugin ? '/workflowplugin' : '/workflowedit'}/${item.flowNode.subProcessId}/2/subprocessHistory/${
                item.workId
              }_${item.instanceId}`,
            )
          }
        >
          {_l('查看详情')}
        </span>
      </Fragment>
    );
  }

  renderAgentMessage(item) {
    const { id } = this.props;
    const { processInfo } = this.state;
    const { flowNode } = item;

    return (
      <span
        className="ThemeColor3 ThemeHoverColor2 pointer"
        onClick={() => logDialog({ processId: processInfo.id, nodeId: flowNode.id, instanceId: id })}
      >
        {_l('查看详情')}
      </span>
    );
  }

  renderRetryBtn(retryPosition) {
    const { data, isRetry } = this.state;
    const { instanceLog, logs } = data;
    const { cause } = instanceLog;
    const showRetry = _.includes([3, 4], data.status) && !_.includes([6666, 7777], cause);
    const showSuspend = data.status === 1;

    if (showRetry || showSuspend) {
      return (
        <Tooltip title={showRetry ? _l('从失败或中止的节点处开始重试') : _l('中止流程')}>
          <div
            className={cx(
              'historyDetailRetry',
              isRetry ? 'historyDetailRetryDisabled' : 'ThemeHoverColor2 ThemeHoverBorderColor2',
            )}
            onClick={e => {
              e.stopPropagation();

              this.retryPosition = retryPosition;
              this.operationInstance(showRetry ? instanceVersion.resetInstance : instanceVersion.endInstance);
            }}
          >
            {showRetry ? (
              <Fragment>
                <Icon className="Font14 mRight3" icon="refresh1" />
                {_l('重试')}
                {!!logs.length && '#' + logs.length}
              </Fragment>
            ) : (
              <Fragment>
                <Icon className="Font14 mRight3" icon="block" />
                {_l('中止')}
              </Fragment>
            )}
          </div>
        </Tooltip>
      );
    }

    return null;
  }

  operationInstance = ajax => {
    const { isRetry } = this.state;
    const { id } = this.props;

    if (isRetry) return;

    this.setState({ isRetry: true });

    ajax({ instanceId: id })
      .then(data => {
        this.setState({ data, isRetry: false });
      })
      .catch(() => {
        this.setState({ isRetry: false });
      });
  };

  renderTemplateInfo = item => {
    return <div className="info">{item.workItems.map(o => o.opinion).join('、')}</div>;
  };

  /**
   * 缩减层级
   */
  indentLevel(prveId) {
    const { data } = this.state;
    const { works } = data;
    let level = 0;

    while (true) {
      const branchItem = works.find(item => _.includes(item.flowNode.flowIds || [], prveId));
      const parentItem = works.find(item => item.flowNode.id === prveId);

      if (branchItem) {
        level++;
        prveId = _.get(branchItem, 'flowNode.prveId');
      } else {
        prveId = _.get(parentItem, 'flowNode.prveId');
      }

      if (!prveId) {
        break;
      }
    }

    return level > 9 ? 9 : level;
  }

  render() {
    const { onClick, id, openNodeDetail, isPlugin } = this.props;
    const { data, isRetry, processInfo } = this.state;

    if (_.isEmpty(data)) return <LoadDiv />;

    const { works, title, createDate, instanceLog, completeType } = data;
    const { cause, nodeName, causeMsg } = instanceLog;
    const { status } = FLOW_STATUS[data.status];
    const { color, bgColor } = STATUS2COLOR[status];
    const resultTypeText = {
      1: _l('同意'),
      2: _l('拒绝'),
      3: _l('有数据'),
      4: _l('无数据'),
    };

    return (
      <div className="historyDetailWrap">
        <div className="header" onClick={onClick}>
          <Icon icon="backspace" className="Font20 Gray_75" />
          <span className="backText Font15">{_l('返回')}</span>
        </div>
        <div className="detailContent">
          <div className={cx('itemInfo', status)} style={{ backgroundColor: bgColor }}>
            {isRetry && this.retryPosition === 'header' && <div className="workflowRetryLoading" />}
            <HistoryStatus statusCode={data.status} size={44} color={color} textSize={18} />
            <div className="title flex mRight15">
              <div className="overflow_ellipsis Font18">
                {_l('数据：') +
                  (works.length && works[0].flowNode.appType === 17 ? title || _l('输入参数') : title || '')}
              </div>
              <div style={{ color }}>
                {cause
                  ? cause === 40007
                    ? FLOW_FAIL_REASON[cause]
                    : !nodeName
                      ? FLOW_FAIL_REASON[cause] || causeMsg
                      : `${_l('节点:')} ${nodeName}, ${
                          cause === 7777 ? _l('过期自动中止') : FLOW_FAIL_REASON[cause] || causeMsg
                        }`
                  : ''}
              </div>
            </div>
            <div className="time">
              <div className="Font15 Gray_75">{createDate}</div>
              {this.renderRetryBtn('header')}
            </div>
          </div>
          <div className="logWrap">
            <div className="logTitle Font16 Gray_75 flexRow alignItemsCenter">
              <div className="flex">{_l('日志')}</div>
              {_.includes(data.debugEvents, -1) && <div className="Font13 Normal">{_l('编辑版测试')} </div>}
              {!_.isEmpty(processInfo) && !_.includes(data.debugEvents, -1) && (
                <div className="Font13 Normal">
                  {_l('版本：%0', moment(processInfo.lastPublishDate).format('YYYY-MM-DD HH:mm'))}
                  <span
                    className="mLeft5 ThemeColor3 ThemeHoverColor2 pointer"
                    onClick={() => {
                      location.href = `${isPlugin ? '/workflowplugin' : '/workflowedit'}/${
                        processInfo.id
                      }/1/execHistory/${id}`;
                    }}
                  >
                    {_l('详情')}
                  </span>
                </div>
              )}
            </div>
            <ul className="logList">
              {works.map((item, index) => {
                const { flowNode, startDate, endDate, status, logs, multipleLevelType, sort, app } = item;
                const { name, alias, resultTypeId, appType } = flowNode;
                const { type } = NODE_TYPE[flowNode.child && flowNode.type === 0 ? 16 : flowNode.type] || {};

                return (
                  <li key={index}>
                    {isRetry && index === works.length - 1 && this.retryPosition === 'list' && (
                      <div className="workflowRetryLoading" />
                    )}

                    <div className="flowItemHistory flexRow">
                      <HistoryStatus
                        config={NODE_STATUS}
                        statusCode={data.status === 1 && index === works.length - 1 && status === 2 ? 1 : status}
                      />
                      {!!(logs || []).length && (
                        <span className="mLeft8">
                          <div className="historyDetailRetryResult">{_l('重试') + '#' + logs.length}</div>
                        </span>
                      )}
                      {index === works.length - 1 && <span className="mLeft8">{this.renderRetryBtn('list')}</span>}
                    </div>

                    <div className="originNode">
                      <div style={{ marginLeft: this.indentLevel(flowNode.prveId) * 20 }}></div>
                      <NodeIcon
                        type={type}
                        appType={appType}
                        actionId={flowNode.actionId}
                        isPlugin={isPlugin}
                        isFirst={index === 0}
                        isLast={index === works.length - 1}
                      />
                      <div className="nodeName Font15 overflow_ellipsis flexColumn">
                        <div
                          title={name}
                          className="pointer ThemeHoverColor3"
                          onClick={() =>
                            (!_.includes([1, 30], flowNode.type) || (!resultTypeId && flowNode.flowIds[0])) &&
                            openNodeDetail({
                              processId: processInfo.id,
                              selectNodeId: flowNode.type === 1 ? flowNode.flowIds[0] : flowNode.id,
                              selectNodeType: flowNode.type === 1 ? 2 : flowNode.type,
                              debugEvents: data.debugEvents,
                            })
                          }
                        >
                          {flowNode.type !== 1
                            ? name
                            : resultTypeId
                              ? resultTypeText[
                                  (_.find(flowNode.flows, o => o.id === flowNode.flowIds[0]) || {}).resultTypeId ||
                                    resultTypeId
                                ]
                              : (_.find(flowNode.flows, o => flowNode.type === 1 && o.id === flowNode.flowIds[0]) || {})
                                  .name || _l('分支')}
                          {!_.includes([0, 11], multipleLevelType) && sort && _l('（第%0级）', sort)}
                        </div>
                        {alias && <div className="Gray_75 Font13 ellipsis">{_l('别名：%0', alias)}</div>}
                        {app && appType !== APP_TYPE.EVENT_PUSH && (
                          <div className="Gray_75 Font13 ellipsis">{_l('工作表 “%0”', app.name)}</div>
                        )}
                      </div>
                    </div>

                    <div className="operationPerson">
                      {_.includes([16, 20, 26, 29], flowNode.type)
                        ? this.renderSubProcess(item)
                        : flowNode.type === 19
                          ? this.renderTemplateInfo(item)
                          : flowNode.type === 33
                            ? this.renderAgentMessage(item)
                            : this.renderOperationInfo(item, index === works.length - 1)}
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
                  <div className="TxtCenter Gray_75 w100">{_l('流程已结束')}</div>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    );
  }
}
