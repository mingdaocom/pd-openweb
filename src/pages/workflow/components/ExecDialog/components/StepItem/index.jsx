import React, { Component, Fragment } from 'react';
import { object, number, string, bool, array, func } from 'prop-types';
import cx from 'classnames';
import { Tooltip, Icon, Linkify, UserHead } from 'ming-ui';
import moment from 'moment';
import { renderToString } from 'react-dom/server';
import _ from 'lodash';
import './index.less';
import { browserIsMobile, getIconNameByExt, dateConvertToUserZone } from 'src/util';
import WorksheetRecordLogDialog from 'src/pages/worksheet/components/WorksheetRecordLog/WorksheetRecordLogDialog';
import previewAttachments from 'src/components/previewAttachments/previewAttachments';
import RegExpValidator from 'src/util/expression';
const UNNECESSARY_OPERATION_CODE = 22;
const OVERRULE = 5;

const WAIT_TEXT = {
  3: _l('等我填写...'),
  4: _l('等我审批...'),
  5: _l('等我查看...'),
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
  1: _l('填写'),
  2: _l('转交'),
  3: _l('查看'),
  4: _l('通过'),
  5: _l('否决'),
  8: _l('转审'),
  9: _l('添加审批人'),
  10: _l('被移除'),
  13: _l('撤回后重新发起'),
  16: _l('审批前加签'),
  17: _l('同意并加签'),
  18: _l('修改申请内容'),
  19: _l('撤回后重新发起'),
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

const SIGN_COUNTERSIGN_TYPE = {
  1: _l('会签'),
  2: _l('会签'),
  3: _l('或签'),
};

/**
 * 格式化时间
 */
const formatTime = time => moment(dateConvertToUserZone(time)).format('YYYY-MM-DD HH:mm:ss');

export default class StepItem extends Component {
  static propTypes = {
    data: object,
    currentType: number,
    currentWork: object,
    worksheetId: string,
    rowId: string,
    isLast: bool,
    status: number,
    appId: string,
    projectId: string,
    currents: array,
    controls: array,
    onChangeCurrentWork: func,
  };
  static defaultProps = {
    data: {},
    currentType: 0,
    currentWork: {},
    worksheetId: '',
    rowId: '',
    isLast: false,
    status: 0,
    currents: [],
    appId: '',
    projectId: '',
    controls: [],
    onChangeCurrentWork: () => {},
  };

  state = {
    moreOperationVisible: false,
    showLogDialog: false,
    showMore: false,
  };

  /**
   * 根据类型的不同渲染内容
   */
  renderDetail = item => {
    let { data, currentWork, status } = this.props;
    let { workId, flowNode = {} } = data || {};
    const {
      type,
      workItemAccount,
      administrator,
      operationTime,
      workItemLog,
      viewTime,
      logIds,
      principal,
      receiveTime,
    } = item;
    /** 是否是当前用户 */
    let isCurrentUser = md.global.Account.accountId === workItemAccount.accountId;
    /** 是否是当前流程节点 */
    let isCurrentWork = workId === (currentWork || {}).workId;

    // 撤回
    if (status === 6 && !operationTime) {
      return (
        <Fragment>
          <div className="flexRow alignItemsCenter">
            <div className="userName">{workItemAccount.fullName}</div>
            <div className="action ellipsis action-13">{_l('撤回')}</div>
            <div className="flex" />
          </div>
          {this.renderAdditionalContent({ ...item, ...{ operationTime: receiveTime } })}
        </Fragment>
      );
    }

    if (!operationTime && !logIds) {
      // 等我操作
      if (isCurrentWork && isCurrentUser) {
        return <div className="waitInfo current Font14 bold">{WAIT_TEXT[type]}</div>;
      }
      if (workItemLog && workItemLog.action === UNNECESSARY_OPERATION_CODE) {
        return (
          <Fragment>
            <div className="userName">
              {workItemAccount.fullName + (principal ? _l('(%0委托)', principal.fullName) : '')}
            </div>
            <div className="info">{UNNECESSARY_OPERATION[type]}</div>
          </Fragment>
        );
      }
      return (
        <Fragment>
          <div className="userName">
            {workItemAccount.fullName + (principal ? _l('(%0委托)', principal.fullName) : '')}
          </div>
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
          <div className="userName">
            {workItemAccount.accountId === 'user-undefined' ? _l('发起人为空') : workItemAccount.fullName}
          </div>
          {START_TYPE_TEXT[triggerId] && (
            <div className="info">
              {START_TYPE_TEXT[triggerId]}
              {triggerField && <span className="mLeft4"> ({triggerField})</span>}
            </div>
          )}
        </Fragment>
      );
    }

    if (workItemLog) {
      const { action, actionTargetName } = workItemLog;

      /**
       * 填写节点
       */
      if (type === 3) {
        return (
          <Fragment>
            <div className="flexRow alignItemsCenter">
              <div className="userName">
                {workItemAccount.fullName +
                  (principal ? _l('(%0委托)', principal.fullName) : '') +
                  (administrator ? _l('(%0操作)', administrator.fullName) : '')}
              </div>
              <div className={cx('action ellipsis', `action-${action}`)}>
                {action === UNNECESSARY_OPERATION_CODE
                  ? UNNECESSARY_OPERATION[type]
                  : !operationTime && !!logIds
                  ? _l('暂存')
                  : OPERATION_LOG_ACTION[action] + (_.includes([2], action) ? actionTargetName : '')}
              </div>
              {this.renderLogsContent(item)}
              <div className="flex" />
            </div>
            {this.renderAdditionalContent(item)}
          </Fragment>
        );
      }

      /**
       *  审批节点
       */
      if (type === 4) {
        return (
          <Fragment>
            <div className="flexRow alignItemsCenter">
              <div className="userName">
                {workItemAccount.fullName +
                  (principal ? _l('(%0委托)', principal.fullName) : '') +
                  (administrator ? _l('(%0操作)', administrator.fullName) : '')}
              </div>
              <div className={cx('action ellipsis', `action-${action}`)}>
                {action === UNNECESSARY_OPERATION_CODE ? (
                  UNNECESSARY_OPERATION[type]
                ) : action === OVERRULE && actionTargetName ? (
                  <span style={{ color: '#ff982d' }}>{_l('退回到%0', actionTargetName)}</span>
                ) : !operationTime && !!logIds ? (
                  _l('暂存')
                ) : (
                  OPERATION_LOG_ACTION[action] + (_.includes([8, 9, 16, 17], action) ? actionTargetName : '')
                )}
              </div>
              {this.renderLogsContent(item)}
              <div className="flex" />
            </div>
            {this.renderAdditionalContent(item)}
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
            <div className="timeAction flexRow Gray_75">
              {formatTime(operationTime)}
              <span className="mLeft4">{_l('查看')}</span>
            </div>
          </Fragment>
        );
      }
    }
  };

  /**
   * 渲染日志内容
   */
  renderLogsContent(item) {
    const { appId, worksheetId, rowId, controls } = this.props;
    const { showLogDialog } = this.state;
    const { logIds } = item;

    if (!logIds || !logIds.length) return null;

    return (
      <Fragment>
        <span
          data-tip={_l('查看更新记录')}
          className="pointer mLeft5 Gray_75 ThemeHoverColor3 flexRow"
          onClick={() => this.setState({ showLogDialog: true })}
        >
          <Icon type="visibility" className="Font16" />
        </span>
        {showLogDialog && (
          <WorksheetRecordLogDialog
            appId={appId}
            worksheetId={worksheetId}
            rowId={rowId}
            controls={controls}
            filterUniqueIds={logIds}
            visible
            onClose={() => this.setState({ showLogDialog: false })}
          />
        )}
      </Fragment>
    );
  }

  /**
   * 渲染审批、填写的附加信息
   */
  renderAdditionalContent(item) {
    const { operationTime, opinion, workItemLog, signature, logIds, updateTime, files } = item;
    const { action, fields } = workItemLog || {};

    return (
      <Fragment>
        {fields && fields.length ? (
          <div className="mTop4">
            <span className="Font14 ThemeColor3">{_l('填写%0个字段', fields.length)}</span>
            {!!fields.length && !browserIsMobile() && (
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
                <Icon icon="workflow_info" className="Font16 Gray_75 mLeft4" />
              </Tooltip>
            )}
          </div>
        ) : (
          ''
        )}
        {opinion && <div className="info Gray_75">{opinion}</div>}
        {signature && <div className="infoSignature" style={{ backgroundImage: `url(${signature.server})` }} />}
        {files && this.renderFiles(files)}
        {action !== UNNECESSARY_OPERATION_CODE && (
          <div className="timeAction flexRow Gray_75">
            {operationTime && formatTime(operationTime)}
            {!operationTime && !!logIds && updateTime && formatTime(updateTime)}
          </div>
        )}
      </Fragment>
    );
  }

  /**
   * 渲染附件
   */
  renderFiles(files) {
    return (
      <Fragment>
        <div className="mTop4">
          {files
            .filter(o => RegExpValidator.fileIsPicture(o.ext))
            .map((o, index) => {
              return (
                <div className="fileItemImg InlineBlock pointer" key={index} onClick={() => this.previewAttachments(o)}>
                  <img src={o.previewUrl} />
                </div>
              );
            })}
        </div>
        <div className="mTop4">
          {files
            .filter(o => !RegExpValidator.fileIsPicture(o.ext))
            .map((o, index) => {
              return (
                <div
                  className="fileItemDoc ThemeHoverColor3 pointer"
                  key={index}
                  onClick={() => this.previewAttachments(o)}
                >
                  <span
                    className={`fileIcon fileIcon-${getIconNameByExt(o.ext.replace('.', ''))}`}
                    style={{ width: 20, height: 22 }}
                  />
                  <div className="flex ellipsis mLeft5">{o.originalFilename}</div>
                  <div>{o.ext}</div>
                </div>
              );
            })}
        </div>
      </Fragment>
    );
  }

  /**
   * 预览附件
   */
  previewAttachments(file) {
    previewAttachments({
      attachments: [Object.assign({}, file, { path: file.privateDownloadUrl })],
      callFrom: 'player',
      hideFunctions: ['share', 'saveToKnowlege'],
    });
  }

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
    const workItems = ((data || {}).workItems || []).filter(
      item => _.includes([3, 4], item.type) && !_.includes([2, 8, 9, 10, 22], _.get(item, 'workItemLog.action')),
    );
    const timeConsuming = [];
    const endTimeConsuming = [];

    if (!workItems.length) return null;

    workItems.forEach(item => {
      // 截止时间
      if (item.dueTime) {
        endTimeConsuming.push(moment(item.operationTime) - moment(item.dueTime));
      }

      timeConsuming.push(
        (item.operationTime || item.dueTime ? moment(item.operationTime) : moment()) - moment(item.receiveTime),
      );
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
      const time = this.covertTime(maxTimeConsuming, true);
      return time ? <span className="Gray_75 TxtRight flex ellipsis">{_l('耗时：%0', time)}</span> : null;
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
          {_l('耗时：%0', this.covertTime(maxTimeConsuming) || _l('1秒'))}
        </span>
      </span>
    );
  }

  /**
   * 转换输出时间
   */
  covertTime(time, isUp = false) {
    if (time < 0) time = time * -1;

    const day = Math.floor(time / 24 / 60 / 60 / 1000);
    const hour = Math.floor((time - day * 24 * 60 * 60 * 1000) / 60 / 60 / 1000);
    const min = (time - day * 24 * 60 * 60 * 1000 - hour * 60 * 60 * 1000) / 60 / 1000;

    return `${day ? _l('%0天', day) : ''}${hour ? _l('%0小时', hour) : ''}${
      min ? _l('%0分钟', isUp ? Math.ceil(min) : Math.floor(min) || 1) : ''
    }`;
  }

  /**
   * 渲染剩余时间
   */
  renderSurplusTime() {
    const { data } = this.props;
    let currentAccountNotified = false;
    let workItems = (data || {}).workItems || [];
    const dueTime = _.get(workItems, '[0].dueTime');

    // 无截止时间
    if (!dueTime) return null;

    workItems = workItems.filter(item => {
      if (item.executeTime && item.workItemAccount.accountId === md.global.Account.accountId) {
        currentAccountNotified = true;
      }
      return _.includes([3, 4], item.type) && !item.operationTime;
    });

    // 无未操作的
    if (!workItems.length) return null;

    const time = moment() - moment(dueTime) || 0;

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

  /**
   * 渲染操作副标题
   */
  renderOperatorSubtitle(type, key, debugEventDump) {
    const isTest =
      _.includes(['1', '2', '3'], key) && debugEventDump && debugEventDump[key] && !!debugEventDump[key].length;

    if (!_.includes(['1', '2', '3', '102', '105'], key)) return null;

    if (type === 0) {
      return _.includes(['1', '2', '3'], key) ? _l('（测试）') : _l('（原发起人为空）');
    }

    if (type === 3) {
      return isTest ? _l('（原填写人）') : _l('（没有填写人）');
    }

    if (type === 4) {
      return isTest ? _l('（原审批人）') : _l('（没有审批人）');
    }

    return isTest ? _l('（原抄送人）') : _l('（没有抄送人）');
  }

  render() {
    const { data, currentWork, currentType, isLast, status, currents, onChangeCurrentWork, appId, projectId } =
      this.props;
    const { showMore } = this.state;
    const {
      workId,
      flowNode,
      workItems,
      countersign,
      countersignType,
      condition,
      multipleLevelType,
      sort,
      debugEventDump,
      explain,
      signType,
    } = data || {};
    /** 是否是当前流程节点 */
    let isCurrentWork =
      workId === (currentWork || {}).workId && _.includes([3, 4, 5], currentType) && !_.includes([2, 3, 4], status);
    const isCC = flowNode.type === 5;

    return (
      <li
        className={cx('workflowStep flexRow', { allowSelect: _.includes(currents, workId) && !isCurrentWork })}
        id={`workflowStep_${workId}`}
      >
        <div className="flowPointer flexColumn">
          <div className={cx('pointerItem', { active: isCurrentWork })} />
          {!isLast && <div className="pointerLine" />}
        </div>
        <div className="stepItem flex flexColumn">
          <div className="flexRow alignItemsCenter">
            <div className="stepItemTime Font15 flex ellipsis Gray_75 bold">
              {workItems[0] && createTimeSpan(dateConvertToUserZone(workItems[0].receiveTime))}
            </div>
            {this.renderTimeConsuming()}
            {this.renderSurplusTime()}
          </div>
          <div
            className={cx('stepContentWrap mTop10', { active: isCurrentWork })}
            onClick={() => {
              if (_.includes(currents, workId) && !isCurrentWork) {
                onChangeCurrentWork(workId);
              }
            }}
          >
            <div className={'stepName bold Font15 flex ellipsis'}>
              {flowNode.name}
              {!!signType && `-${SIGN_COUNTERSIGN_TYPE[signType]}`}
              {!_.includes([0, 11], multipleLevelType) && sort && _l('（第%0级）', sort)}
              {isCC && `(${workItems.length})`}
            </div>

            {countersign && (
              <div className="mTop6 mLeft14 mRight14 Gray_75">
                {countersignType === 3
                  ? MULTIPLE_OPERATION[flowNode.type || '4']
                  : `${condition ? condition + '%' : ''}${SIGN_TYPE[countersignType]}`}
              </div>
            )}

            {workItems[0].type === 5 && (
              <Fragment>
                <div
                  className="mTop6 mLeft14 mRight14 breakAll Gray_75"
                  style={{ whiteSpace: 'normal' }}
                  dangerouslySetInnerHTML={{
                    __html: filterXSS(this.generateLink(workItems[0].opinion)),
                  }}
                />
              </Fragment>
            )}

            {isCurrentWork && _.includes([3, 4], flowNode.type) && explain && (
              <div className="mTop6 mLeft14 mRight14 breakAll">{explain}</div>
            )}

            {(isCC && workItems.length > 5 && !showMore ? workItems.slice(0, 5) : workItems).map((item, index) => {
              let { workItemAccount } = item;
              const { avatar, accountId } = workItemAccount;
              return (
                <div
                  key={index}
                  className={cx('stepContent flexRow', { Border0: showMore && index === workItems.length - 1 })}
                >
                  <div className="avatarBoxCon">
                    <UserHead size={36} user={{ userHead: avatar, accountId }} appId={appId} projectId={projectId} />
                  </div>
                  <div className="stepDetail flex flexColumn">{this.renderDetail(item)}</div>
                </div>
              );
            })}

            {debugEventDump &&
              Object.keys(debugEventDump).map((key, index) => {
                return (
                  <div className="stepContent pBottom16" key={index}>
                    <div className="mTop10 Gray_75 Font12">
                      {_.includes(['1', '2', '3'], key) && _l('测试')}
                      {key === '101' && _l('自动通过')}
                      {_.includes(['102', '105'], key) && _l('代理')}
                      {key === '103' && _l('流程中止')}
                      {key === '104' && _l('自动进入下一个节点')}

                      {this.renderOperatorSubtitle(flowNode.type, key, debugEventDump)}
                    </div>
                    {debugEventDump[key].map(({ avatar, accountId, fullName }) => (
                      <div className="flexRow alignItemsCenter mTop8" key={accountId}>
                        <UserHead size={24} user={{ userHead: avatar, accountId }} projectId={projectId} />
                        <span className="flex ellipsis mLeft12">{fullName}</span>
                      </div>
                    ))}
                  </div>
                );
              })}

            {isCC && workItems.length > 5 && (
              <div
                className="TxtCenter pointer ThemeColor3 ThemeHoverColor2 mTop10 mBottom10"
                onClick={() => this.setState({ showMore: !showMore })}
              >
                {showMore ? _l('收起') : _l('展开')}
                <Icon type={showMore ? 'arrow-up-border' : 'arrow-down-border'} className="mLeft2 Font14" />
              </div>
            )}
          </div>
        </div>
      </li>
    );
  }
}
