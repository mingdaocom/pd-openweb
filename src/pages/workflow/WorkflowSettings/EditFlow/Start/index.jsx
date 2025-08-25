import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import moment from 'moment';
import {
  ACTION_ID,
  APP_TYPE,
  APP_TYPE_TEXT,
  CUSTOM_ACTION_TEXT,
  DATE_TYPE,
  EXEC_TIME_TYPE,
  NODE_TYPE,
  TIME_TYPE_NAME,
  TRIGGER_ID,
} from '../../enum';
import { getIcons, getStartNodeColor } from '../../utils';
import { CreateNode, MembersName, NodeOperate, WhiteNode } from '../components';

export default class Start extends Component {
  constructor(props) {
    super(props);
  }

  /**
   * 渲染内容
   */
  renderContent() {
    const { item, child, isNestedProcess } = this.props;

    // 子流程
    if (child && !isNestedProcess) {
      return (
        <Fragment>
          <div className="workflowContentInfo ellipsis workflowContentBG">
            <span className="Gray_75">{_l('数据源：')}</span>
            {item.appType === APP_TYPE.SHEET ? _l('工作表“%0”', item.appName) : APP_TYPE_TEXT[item.appType]}
          </div>
          <div className="pLeft8 pRight8 mTop9 Gray_75 pBottom5">
            {(item.assignFieldNames || []).length ? (
              <Fragment>
                {item.assignFieldNames.map(o => `“${o}”`).join('、')}
                <span className="mLeft5">{_l('触发')}</span>
              </Fragment>
            ) : (
              <span className="Gray_75">{_l('未被任何流程触发')}</span>
            )}
          </div>
        </Fragment>
      );
    }

    if (item.appType === APP_TYPE.PBC && !item.appId) {
      return <div className="workflowStartNull">{_l('设置输入参数')}</div>;
    }

    if (
      (_.includes([APP_TYPE.SHEET, APP_TYPE.DATE, APP_TYPE.EVENT_PUSH], item.appType) && !item.appName) ||
      (item.appType === APP_TYPE.LOOP && !item.executeTime) ||
      (item.appType === APP_TYPE.WEBHOOK && !item.count) ||
      (_.includes([APP_TYPE.USER, APP_TYPE.DEPARTMENT, APP_TYPE.EXTERNAL_USER], item.appType) && !item.triggerId)
    ) {
      return <div className="workflowStartNull">{_l('设置触发方式')}</div>;
    }

    // 工作表触发 || 事件推送
    if (_.includes([APP_TYPE.SHEET, APP_TYPE.EVENT_PUSH], item.appType)) {
      return (
        <Fragment>
          <div className="workflowContentInfo ellipsis workflowContentBG">
            <span className="Gray_75">{item.appTypeName}</span>“{item.appName}”
          </div>
          <div className="workflowContentInfo ellipsis mTop4">
            {(item.triggerId === TRIGGER_ID.EDIT || item.triggerId === TRIGGER_ID.ONLY_EDIT) && (
              <span>
                {item.triggerId === TRIGGER_ID.EDIT ? _l('当新增和更新记录时触发') : _l('当更新记录时触发')}
                {item.assignFieldName && _l('：指定字段')}
                {item.assignFieldName && <span className="blue">{item.assignFieldName}</span>}
              </span>
            )}
            {item.triggerId === TRIGGER_ID.ADD && _l('当新增记录时触发')}
            {item.triggerId === TRIGGER_ID.DELETE && _l('当删除记录时触发')}
          </div>
        </Fragment>
      );
    }

    // 循环触发
    if (item.appType === APP_TYPE.LOOP) {
      const days = [_l('星期日'), _l('星期一'), _l('星期二'), _l('星期三'), _l('星期四'), _l('星期五'), _l('星期六')];
      const isNew = item.interval === -1;

      return (
        <div className="pLeft8 pRight8 pTop5 pBottom5">
          <div className={cx({ Gray_75: !isNew })}>
            {_l('从 %0 开始', moment(item.executeTime).format('YYYY-MM-DD HH:mm'))}
          </div>

          {!isNew && (
            <Fragment>
              {item.frequency === DATE_TYPE.MINUTE && (
                <div className="mTop5">{_l('每%0分钟触发', item.interval > 1 ? ` ${item.interval} ` : '')}</div>
              )}
              {item.frequency === DATE_TYPE.HOUR && (
                <div className="mTop5">{_l('每%0小时触发', item.interval > 1 ? ` ${item.interval} ` : '')}</div>
              )}
              {item.frequency === DATE_TYPE.DAY && (
                <div className="mTop5">
                  {_l(
                    '每%0天 %1 触发',
                    item.interval > 1 ? ` ${item.interval} ` : '',
                    moment(item.executeTime).format('HH:mm'),
                  )}
                </div>
              )}
              {item.frequency === DATE_TYPE.WEEK && (
                <div className="mTop5">
                  {_l(
                    '每%0周(%1) %2 触发',
                    item.interval > 1 ? ` ${item.interval} ` : '',
                    item.weekDays
                      .sort((a, b) => a - b)
                      .map(o => days[o])
                      .join('、'),
                    moment(item.executeTime).format('HH:mm'),
                  )}
                </div>
              )}
              {item.frequency === DATE_TYPE.MONTH && (
                <div className="mTop5">
                  {_l(
                    '每%0个月在第 %1 天 %2 触发',
                    item.interval > 1 ? ` ${item.interval} ` : '',
                    moment(item.executeTime).format('DD'),
                    moment(item.executeTime).format('HH:mm'),
                  )}
                </div>
              )}
              {item.frequency === DATE_TYPE.YEAR && (
                <div className="mTop5">
                  {_l(
                    '每%0年在 %1 触发',
                    item.interval > 1 ? ` ${item.interval} ` : '',
                    moment(item.executeTime).format('MMMDo HH:mm'),
                  )}
                </div>
              )}
            </Fragment>
          )}
        </div>
      );
    }

    // 日期触发
    if (item.appType === APP_TYPE.DATE) {
      return (
        <Fragment>
          <div className="workflowContentInfo ellipsis workflowContentBG">
            <span className="Gray_75">{item.appTypeName}</span>“{item.appName}”
          </div>
          <div className="workflowContentInfo ellipsis mTop4">
            <span className={cx({ red: !item.assignFieldName })}>{item.assignFieldName || _l('字段不存在')}</span>
            {!!item.number && (
              <span className="mLeft5">
                {item.executeTimeType === EXEC_TIME_TYPE.BEFORE
                  ? _l('之前')
                  : item.executeTimeType === EXEC_TIME_TYPE.AFTER
                    ? _l('之后')
                    : ''}
                {item.executeTimeType !== EXEC_TIME_TYPE.CURRENT && (
                  <span>{item.number + TIME_TYPE_NAME[item.unit]}</span>
                )}
              </span>
            )}

            {item.assignFieldType === 15 && <span className="mLeft5">{item.time}</span>}
            <span className="mLeft5">{_l('执行')}</span>
          </div>
        </Fragment>
      );
    }

    // webhook触发
    if (item.appType === APP_TYPE.WEBHOOK) {
      return (
        <Fragment>
          <div className="workflowContentInfo ellipsis Gray_75">{_l('从请求范例生成参数列表')}</div>
          <div className="workflowContentInfo ellipsis">
            <span className="Gray_75">{_l('已配置：')}</span>
            {_l('%0 个参数', item.count)}
          </div>
        </Fragment>
      );
    }

    // 自定义动作触发
    if (item.appType === APP_TYPE.CUSTOM_ACTION) {
      return (
        <Fragment>
          <div className="workflowContentInfo ellipsis">
            <span className="Gray_75">{_l('按钮：')}</span>
            {item.triggerName}
          </div>
          <div className="workflowContentInfo ellipsis Gray_75">{CUSTOM_ACTION_TEXT[item.clickType || 1]}</div>
        </Fragment>
      );
    }

    // 外部用户讨论触发
    if (item.triggerId === TRIGGER_ID.DISCUSS) {
      return <div className="pLeft8 pRight8 Gray_75">{_l('当外部用户收到讨论通知时（被回复、被提到）触发')}</div>;
    }

    // 成员与部门
    if (_.includes([APP_TYPE.USER, APP_TYPE.DEPARTMENT, APP_TYPE.EXTERNAL_USER], item.appType)) {
      const TEXT = {
        [APP_TYPE.USER]: {
          [TRIGGER_ID.ADD]: _l('当新人入职时'),
          [TRIGGER_ID.DELETE]: _l('当人员离职时'),
        },
        [APP_TYPE.DEPARTMENT]: {
          [TRIGGER_ID.ADD]: _l('当创建部门时'),
          [TRIGGER_ID.DELETE]: _l('当解散部门时'),
        },
        [APP_TYPE.EXTERNAL_USER]: {
          [TRIGGER_ID.ADD]: _l('当新用户注册时'),
          [TRIGGER_ID.ONLY_EDIT]: _l('当用户登录时'),
          [TRIGGER_ID.DELETE]: _l('当用户注销时'),
          [TRIGGER_ID.STOP]: _l('当用户被停用时'),
        },
      };
      return (
        <Fragment>
          <div className="workflowContentInfo ellipsis">{TEXT[item.appType][item.triggerId]}</div>
        </Fragment>
      );
    }

    // PBC
    if (item.appType === APP_TYPE.PBC) {
      return (
        <Fragment>
          <div className="workflowContentInfo ellipsis">{_l('%0个输入参数', item.count)}</div>
          {item.isCallBack && (
            <div className="workflowContentInfo ellipsis">
              {_l('已启用平台API能力')}
              <span className="ThemeColor3 ThemeHoverColor2 mLeft5" onMouseDown={this.openDocument}>
                {_l('查看文档')}
                <i className="mLeft5 icon-task-new-detail Font12" />
              </span>
            </div>
          )}
        </Fragment>
      );
    }

    // 审批流程
    if (item.appType === APP_TYPE.APPROVAL_START) {
      if (isNestedProcess) {
        return (
          <div className="pLeft8 pRight8 pBottom5 pTop5">
            <span className="Gray_75">{_l('发起人：')}</span>
            {(item.accounts || []).length ? <MembersName {...this.props} accounts={item.accounts} /> : '[]'}
          </div>
        );
      }

      return (
        <Fragment>
          <div className="workflowContentInfo ellipsis workflowContentBG">
            <span className="Gray_75">{_l('数据对象：')}</span>
            {_l('工作表“%0”', item.appName)}
          </div>
          <div className="pLeft8 pRight8 mTop9 Gray_75 pBottom5">
            “{item.triggerName || <span style={{ color: '#f44336' }}>{_l('流程已删除')}</span>}”
            <span className="mLeft5">{_l('触发')}</span>
          </div>
        </Fragment>
      );
    }

    // 循环流程
    if (item.appType === APP_TYPE.LOOP_PROCESS) {
      return (
        <div className="pLeft8 pRight8 pBottom5 pTop5">
          <span className="Gray_75">
            {item.triggerId
              ? item.triggerId === ACTION_ID.CONDITION_LOOP
                ? _l('满足条件时循环')
                : _l('循环指定次数')
              : _l('循环触发')}
          </span>
        </div>
      );
    }
  }

  openDocument = evt => {
    const { relationId } = this.props;

    evt.stopPropagation();
    window.open(`/worksheetapi/${relationId}`);
  };

  render() {
    const { processId, item, selectNodeId, openDetail, isCopy, child, isSimple, isNestedProcess, isPlugin } =
      this.props;

    if (isPlugin) {
      return (
        <WhiteNode
          nodeId={item.id}
          nodeName={_l('输入参数')}
          nodeDesc={_l('设置输入参数')}
          isComplete={item.appId}
          isCopy={isCopy}
          hasError={item.appId && item.isException}
          isActive={_.includes([item.id, item.triggerNodeId], selectNodeId)}
          onClick={() => openDetail(processId, item.id, item.typeId)}
        />
      );
    }

    return (
      <div className="flexColumn">
        <section className="workflowBox" data-id={item.id}>
          <div
            className={cx(
              'workflowItem',
              { workflowItemDisabled: isCopy },
              {
                errorShadow:
                  (item.appId && !item.appName && !_.includes([APP_TYPE.PBC, APP_TYPE.LOOP_PROCESS], item.appType)) ||
                  (_.includes([APP_TYPE.DATE, APP_TYPE.PBC, APP_TYPE.LOOP_PROCESS], item.appType) && item.isException),
              },
              { active: _.includes([item.id, item.triggerNodeId], selectNodeId) },
            )}
            onMouseDown={() => {
              if (isNestedProcess) {
                openDetail(item.triggerId, item.triggerNodeId, NODE_TYPE.APPROVAL_PROCESS);
              } else {
                openDetail(processId, item.id, item.typeId);
              }
            }}
          >
            <div className="workflowAvatars flexRow">
              <i
                className={cx(
                  'workflowAvatar',
                  child && !isNestedProcess ? 'BGBlueAsh' : getStartNodeColor(item.appType, item.triggerId),
                  child && !isNestedProcess ? 'icon-subprocess' : getIcons(item.typeId, item.appType, item.triggerId),
                )}
              />
            </div>
            <NodeOperate
              nodeClassName={child && !isNestedProcess ? 'BGBlueAsh' : getStartNodeColor(item.appType, item.triggerId)}
              {...this.props}
            />
            <div className="workflowContent">
              {isSimple ? <span className="pLeft8 pRight8 Gray_75">{_l('加载中...')}</span> : this.renderContent()}
            </div>
          </div>

          <CreateNode {...this.props} />
        </section>
      </div>
    );
  }
}
