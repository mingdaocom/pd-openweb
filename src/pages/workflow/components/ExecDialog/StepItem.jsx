import React, { Component, Fragment } from 'react';
import { object, number } from 'prop-types';
import cx from 'classnames';
import UserHead from 'src/pages/feed/components/userHead/userHead';
import { Tooltip, Icon } from 'ming-ui';
import moment from 'moment';
import Linkify from 'react-linkify';
import { renderToString } from 'react-dom/server';

const UNNECESSARY_OPERATION_CODE = 22;
const OVERRULE = 5;

const WAIT_TEXT = {
  3: _l('等你填写...'),
  4: _l('等你审核...'),
  5: _l('等你查看...'),
};

const SIGN_TYPE = {
  1: _l('需全员通过'),
  2: _l('只需一人通过，需全员否决'),
};

const MULTIPLE_OPERATION = {
  3: _l('设置多个填写人,由任意一人进行填写'),
  4: _l('设置多个审批人,由任意一人进行审批'),
};

const OPERATION_LOG_ACTION = {
  0: _l('发起'),
  1: _l('提交'),
  2: _l('转交'),
  3: _l('查看'),
  4: _l('通过申请'),
  5: _l('否决申请'),
  8: _l('转审'),
  9: _l('添加审批人'),
  16: _l('审批前加签'),
  17: _l('通过申请并加签'),
  18: _l('修改申请内容'),
  22: _l('无需审批'),
};

const UNNECESSARY_OPERATION = {
  3: _l('无需填写'),
  4: _l('无需审批'),
};

const START_TYPE_TEXT = {
  '1': _l('新增记录'),
  '2': _l('新增或更新记录'),
};

/**
 * 格式化时间
 */
const formatTime = time => moment(time).format('YYYY年MMMDo HH:mm');

export default class StepItem extends Component {
  static propTypes = {
    data: object,
    currentType: number,
    currentWork: object,
  };
  static defaultProps = {
    data: {},
    currentType: 0,
    currentWork: {},
  };

  /**
   * 节点步骤一经渲染便不会改变,故阻止更新以优化性能
   */
  shouldComponentUpdate() {
    return false;
  }

  /**
   * 根据类型的不同渲染内容
   */
  renderDetail = item => {
    let { data, currentWork } = this.props;
    let { workId, flowNode = {} } = data;
    const { type, workItemAccount, operationTime, opinion, workItemLog, viewTime, signature } = item;
    /** 是否是当前用户 */
    let isCurrentUser = md.global.Account.accountId === workItemAccount.accountId;
    /** 是否是当前流程节点 */
    let isCurrentWork = workId === currentWork.workId;
    if (!operationTime) {
      if (workItemLog && workItemLog.action === UNNECESSARY_OPERATION_CODE) {
        return (
          <Fragment>
            <div className="userName">{workItemAccount.fullName}</div>
            <div className="info">{UNNECESSARY_OPERATION[type]}</div>
          </Fragment>
        );
      }
      if (isCurrentWork && isCurrentUser) {
        return <div className="waitInfo current Font14">{WAIT_TEXT[type]}</div>;
      }
      return (
        <Fragment>
          <div className="userName">{workItemAccount.fullName}</div>
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
          <div className="userName">{workItemAccount.fullName}</div>
          <div className="timeAction flexRow">
            <span className="Gray_9e">{_l('于 %0', formatTime(operationTime))}</span>
            <div className="action">{_l('发起流程')}</div>
          </div>
          <div className="info">
            {START_TYPE_TEXT[triggerId]}
            {triggerField && <span className="triggerField"> ({triggerField})</span>}
          </div>
        </Fragment>
      );
    }
    if (workItemLog) {
      const { action, actionTargetName, fields } = workItemLog;

      /**
       * 填写节点
       */
      if (type === 3) {
        return (
          <Fragment>
            <div className="userName">{workItemAccount.fullName}</div>
            <div className="timeAction flexRow">
              {action !== UNNECESSARY_OPERATION_CODE && (
                <span className="Gray_9e">{_l('于 %0', formatTime(operationTime))}</span>
              )}

              <div className={cx('action', `action-${action}`)}>
                {action === UNNECESSARY_OPERATION_CODE ? UNNECESSARY_OPERATION[type] : OPERATION_LOG_ACTION[action]}
              </div>
              {actionTargetName && <div className="targetName">{actionTargetName}</div>}
            </div>
            {fields && (
              <div className="info Font12">
                <span className="pointer">{_l('填写了%0个字段', fields.length)}</span>
                {!!fields.length && (
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
                    <span className="modifiedFieldInfo">
                      <Icon icon="workflow_info Font16 Gray_9e" />
                    </span>
                  </Tooltip>
                )}
              </div>
            )}
            {opinion && (
              <div className="info Font12">
                {_l('备注: ')}
                {opinion}
              </div>
            )}
          </Fragment>
        );
      }

      /**
       *  审批节点
       */
      if (type === 4) {
        return (
          <Fragment>
            <div className="userName">{workItemAccount.fullName}</div>
            <div className="timeAction flexRow">
              {action !== UNNECESSARY_OPERATION_CODE && (
                <span className="Gray_9e">{_l('于 %0', formatTime(operationTime))}</span>
              )}

              {action === UNNECESSARY_OPERATION_CODE ? (
                <Fragment>
                  <div className={cx('action', `action-${action}`)}>{UNNECESSARY_OPERATION[type]}</div>
                  {actionTargetName && <div className="targetName">{actionTargetName}</div>}
                </Fragment>
              ) : (
                <Fragment>
                  <div className={cx('action', `action-${action}`)}>
                    {action === OVERRULE && actionTargetName
                      ? _l('退回到%0', actionTargetName)
                      : OPERATION_LOG_ACTION[action]}
                  </div>
                </Fragment>
              )}
            </div>
            {opinion && (
              <div className="info Font12">
                {_l('备注：')}
                {opinion}
              </div>
            )}
            {signature && (
              <div className="info Font12 flexRow">
                <div>{_l('签名：')}</div>
                <div className="flex infoSignature" style={{ backgroundImage: `url(${signature.server})` }} />
              </div>
            )}
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
            <div className="timeAction flexRow">
              <span className="Gray_9e">{_l('于 %0', formatTime(operationTime))}</span>
              <div className="action">{_l('查看')}</div>
            </div>
          </Fragment>
        );
      }
    }
  };

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

    (value.match(/\$.*?\$/g) || []).forEach((item, index) => {
      value = value.replace(item, links[index]);
    });

    return value;
  }

  render() {
    const { data, currentWork, currentType } = this.props;
    const { workId, flowNode, workItems, countersign, countersignType } = data;
    /** 是否是当前流程节点 */
    let isCurrentWork = workId === currentWork.workId;

    return (
      <li className="step flexRow">
        <div className="flowPointer flexColumn">
          <div
            className={cx(
              'pointerItem',
              { edit: isCurrentWork && currentType === 3 },
              { approve: isCurrentWork && currentType === 4 },
              { notice: isCurrentWork && currentType === 5 },
            )}
          />
          <div className="pointerLine" />
        </div>
        <div className="stepItem flex flexColumn">
          <div
            className={cx(
              'stepName bold Font15 Gray_75',
              { edit: isCurrentWork && currentType === 3 },
              { approve: isCurrentWork && currentType === 4 },
              { notice: isCurrentWork && currentType === 5 },
            )}
          >
            {flowNode.name}
          </div>
          <div className="stepContentWrap mTop10">
            {countersign && (
              <div className="signTypeWrap flexRow">
                {countersignType === 3 ? (
                  <Fragment>
                    <span>{currentType === 3 ? _l('填写') : _l('或签')}: </span>
                    <div className="signType">{MULTIPLE_OPERATION[currentType]}</div>
                  </Fragment>
                ) : (
                  <Fragment>
                    <span>{_l('会签')}: </span>
                    <div className="signType">{SIGN_TYPE[countersignType]}</div>
                  </Fragment>
                )}
              </div>
            )}

            {workItems[0].type === 5 && (
              <Fragment>
                <div className="Gray_9e pLeft16 pRight16 pTop10">{_l('通知内容：')}</div>
                <div
                  className="pLeft16 pRight16 pTop5 breakAll"
                  style={{ whiteSpace: 'normal' }}
                  dangerouslySetInnerHTML={{
                    __html: filterXSS(this.generateLink(workItems[0].opinion), {
                      stripIgnoreTag: true,
                    }),
                  }}
                ></div>
              </Fragment>
            )}

            {workItems.map((item, index) => {
              let { workItemAccount } = item;
              const { avatar, accountId } = workItemAccount;
              return (
                <div key={index} className="stepContent flexRow">
                  <div className="avatarBox">
                    <UserHead lazy="false" size={33} user={{ userHead: avatar, accountId }} />
                  </div>
                  <div className="stepDetail flex flexColumn">{this.renderDetail(item)}</div>
                </div>
              );
            })}
          </div>
        </div>
      </li>
    );
  }
}
