import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import { CreateNode, NodeOperate, MembersName } from '../components';
import { ACTION_ID, APP_TYPE } from '../../enum';
import { getIcons } from '../../utils';
import _ from 'lodash';

export default class Action extends Component {
  constructor(props) {
    super(props);
  }

  /**
   * 渲染内容
   */
  renderContent() {
    const { item } = this.props;

    if (
      (!item.appId && !item.selectNodeId && !_.includes([APP_TYPE.PROCESS, APP_TYPE.CALENDAR], item.appType)) ||
      (_.includes(
        [APP_TYPE.PROCESS, APP_TYPE.EXTERNAL_USER, APP_TYPE.GLOBAL_VARIABLE, APP_TYPE.CALENDAR],
        item.appType,
      ) &&
        !item.fields.length)
    ) {
      return <div className="pLeft8 pRight8 blue">{_l('设置此节点')}</div>;
    }

    // 更新记录
    if (_.includes([APP_TYPE.SHEET, APP_TYPE.EXTERNAL_USER], item.appType) && item.actionId === ACTION_ID.EDIT) {
      if (item.selectNodeName) {
        return (
          <Fragment>
            {item.appType !== APP_TYPE.EXTERNAL_USER && (
              <div className="workflowContentInfo ellipsis workflowContentBG">
                <span className="Gray_9e mRight5">{item.appTypeName}</span>“{item.appName}”
              </div>
            )}
            {item.fields.length === 0 ? (
              <div className="pLeft8 pRight8 mTop8 yellow pBottom5">{_l('未设置可执行的动作')}</div>
            ) : (
              <div className="pLeft8 pRight8 mTop8 Gray_75 pBottom5">
                {_l('修改了%0个字段', item.fields.length)}
                {item.errorFields.length > 0 ? '，' : ''}
                <span className="yellow">{item.errorFields.length || ''}</span>
                {item.errorFields.length > 0 ? _l('个字段存在异常') : ''}
              </div>
            )}
          </Fragment>
        );
      }

      return (
        <div className="pLeft8 pRight8 red">
          <i className="icon-workflow_info Font18 mRight5" />
          {_l('指定的节点对象已删除')}
        </div>
      );
    }

    // 新增工作表记录
    if (item.appType === APP_TYPE.SHEET && item.actionId === ACTION_ID.ADD) {
      if (item.appName) {
        return (
          <Fragment>
            <div className="workflowContentInfo ellipsis workflowContentBG">
              <span className="Gray_9e mRight5">{item.appTypeName}</span>“{item.appName}”
            </div>
            {item.selectNodeId && <div className="pLeft8 pRight8 mTop8 Gray_75">{_l('批量新增')}</div>}

            {item.fields.length === 0 ? (
              <div className={cx('pLeft8 pRight8 yellow pBottom5', item.selectNodeId ? 'mTop4' : 'mTop8')}>
                {_l('未设置可执行的动作')}
              </div>
            ) : (
              <div className={cx('pLeft8 pRight8 Gray_75 pBottom5', item.selectNodeId ? 'mTop4' : 'mTop8')}>
                {_l('填写了%0个字段', item.fields.length)}
                {item.errorFields.length > 0 ? '，' : ''}
                <span className="yellow">{item.errorFields.length || ''}</span>
                {item.errorFields.length > 0 ? _l('个字段存在异常') : ''}
              </div>
            )}
          </Fragment>
        );
      }

      return (
        <div className="pLeft8 pRight8 red">
          <i className="icon-workflow_info Font18 mRight5" />
          {_l('工作表已删除')}
        </div>
      );
    }

    // 删除记录
    if (item.appType === APP_TYPE.SHEET && item.actionId === ACTION_ID.DELETE) {
      if (item.appName) {
        return (
          <Fragment>
            <div className="workflowContentInfo ellipsis workflowContentBG">
              <span className="Gray_9e mRight5">{item.appTypeName}</span>“{item.appName}”
            </div>
            <div className="workflowContentInfo ellipsis Gray_75 mTop4">{_l('删除记录')}</div>
          </Fragment>
        );
      }

      return (
        <div className="pLeft8 pRight8 red">
          <i className="icon-workflow_info Font18 mRight5" />
          {_l('指定的节点对象已删除')}
        </div>
      );
    }

    // 获得指定关联记录
    if (item.appType === APP_TYPE.SHEET && item.actionId === ACTION_ID.RELATION) {
      if (item.selectNodeName) {
        if (!item.controlName || !item.sourceEntityName) {
          return (
            <div className="pLeft8 pRight8 red">
              <i className="icon-workflow_info Font18 mRight5" />
              {_l('未设置关联他表字段')}
            </div>
          );
        }

        return (
          <Fragment>
            <div className="workflowContentInfo ellipsis workflowContentBG">
              <span className="Gray_75 mRight5">{_l('关联表')}</span>“{item.sourceEntityName}”
            </div>
            <div className="workflowContentInfo ellipsis mTop4 Gray_75">
              {_l('从关联字段获取')}
              <span>{item.executeType === 0 ? _l('，无结果时中止或执行查找结果分支') : _l('，无结果时继续执行')}</span>
            </div>
          </Fragment>
        );
      }

      return (
        <div className="pLeft8 pRight8 red">
          <i className="icon-workflow_info Font18 mRight5" />
          {_l('指定的节点对象已删除')}
        </div>
      );
    }

    // 新建任务
    if (item.appType === APP_TYPE.TASK) {
      if (item.appName) {
        return (
          <Fragment>
            <div className="workflowContentInfo ellipsis workflowContentBG">
              <span className="Gray_9e mRight5">{item.appTypeName}</span>“{item.appName}”
            </div>
            <div className="pLeft8 pRight8 mTop4 Gray_75 pBottom5">
              {_l('填写了%0个字段', item.fields.length)}
              {item.errorFields.length > 0 ? '，' : ''}
              <span className="yellow">{item.errorFields.length || ''}</span>
              {item.errorFields.length > 0 ? _l('个字段存在异常') : ''}
            </div>
          </Fragment>
        );
      }

      return (
        <div className="pLeft8 pRight8 red">
          <i className="icon-workflow_info Font18 mRight5" />
          {_l('项目已删除')}
        </div>
      );
    }

    // 更新参数
    if (item.appType === APP_TYPE.PROCESS) {
      return (
        <div className="pLeft8 pRight8 Gray_75">
          {_l('更新了%0个参数', item.fields.length)}
          {item.errorFields.length > 0 ? '，' : ''}
          <span className="yellow">{item.errorFields.length || ''}</span>
          {item.errorFields.length > 0 ? _l('个参数存在异常') : ''}
        </div>
      );
    }

    // 邀请外部用户
    if (item.appType === APP_TYPE.EXTERNAL_USER && item.actionId === ACTION_ID.ADD) {
      if (item.appName) {
        return (
          <Fragment>
            <div className="pLeft8 pRight8 ellipsis Gray_75">
              {item.selectNodeId ? _l('邀请多名用户') : _l('邀请1名用户')}
            </div>
            {item.fields.length === 0 ? (
              <div className="pLeft8 pRight8 mTop4 yellow">{_l('未设置可执行的动作')}</div>
            ) : (
              <div className="pLeft8 pRight8 mTop4 Gray_75">
                {_l('填充%0个用户信息字段', item.fields.length)}
                {item.errorFields.length > 0 ? '，' : ''}
                <span className="yellow">{item.errorFields.length || ''}</span>
                {item.errorFields.length > 0 ? _l('个字段存在异常') : ''}
              </div>
            )}
          </Fragment>
        );
      }

      return (
        <div className="pLeft8 pRight8 red">
          <i className="icon-workflow_info Font18 mRight5" />
          {_l('工作表已删除')}
        </div>
      );
    }

    // 更新全局变量
    if (item.appType === APP_TYPE.GLOBAL_VARIABLE) {
      return (
        <div className="pLeft8 pRight8 Gray_75">
          {_l('更新了%0个变量', item.fields.length)}
          {item.errorFields.length > 0 ? '，' : ''}
          <span className="yellow">{item.errorFields.length || ''}</span>
          {item.errorFields.length > 0 ? _l('个变量存在异常') : ''}
        </div>
      );
    }

    // 创建日程
    if (item.appType === APP_TYPE.CALENDAR) {
      if (item.actionId === ACTION_ID.ADD) {
        const hasFile = item.fields.find(o => o.fieldId === 'create_file').fieldValue === '1';
        const createAccount = item.fields.find(o => o.fieldId === 'create_account_id');
        const members = item.fields.find(o => o.fieldId === 'members');

        return (
          <Fragment>
            <div className={cx('pLeft8 pRight8', { pTop5: hasFile })}>
              <span className="Gray_75">{_l('成员')}：</span>
              {this.getMemberName(createAccount)}
              {_l('（发起人）')}
              {members.fieldValue || members.fieldValueId ? '、' : ''}
              {this.getMemberName(members)}
            </div>
            {hasFile && <div className="pLeft8 pRight8 Gray_75 mTop4 pBottom5">{_l('同时生成ICS文件')}</div>}
          </Fragment>
        );
      }

      return <div className="pLeft8 pRight8 Gray_75">{_l('仅生成ICS文件')}</div>;
    }
  }

  getMemberName(item) {
    if (item.fieldValue) {
      return JSON.parse(item.fieldValue)
        .map(o => o.fullName)
        .join('、');
    }

    return item.fieldValueId ? `${item.nodeName}-${item.fieldValueName}` : '';
  }

  render() {
    const { processId, item, disabled, selectNodeId, openDetail, isSimple } = this.props;
    const bgClassName = _.includes([APP_TYPE.PROCESS, APP_TYPE.GLOBAL_VARIABLE], item.appType)
      ? 'BGBlueAsh'
      : item.appType === APP_TYPE.TASK
      ? 'BGGreen'
      : item.appType === APP_TYPE.CALENDAR
      ? 'BGRed'
      : 'BGYellow';

    return (
      <div className="flexColumn">
        <section className="workflowBox" data-id={item.id}>
          <div
            className={cx(
              'workflowItem',
              { workflowItemDisabled: disabled },
              {
                errorShadow:
                  (((item.appId || item.selectNodeId) &&
                    !_.includes([APP_TYPE.PROCESS, APP_TYPE.CALENDAR], item.appType)) ||
                    (_.includes(
                      [APP_TYPE.PROCESS, APP_TYPE.EXTERNAL_USER, APP_TYPE.GLOBAL_VARIABLE, APP_TYPE.CALENDAR],
                      item.appType,
                    ) &&
                      (item.fields || []).length)) &&
                  item.isException,
              },
              { active: selectNodeId === item.id },
            )}
            onMouseDown={() => !disabled && openDetail(processId, item.id, item.typeId)}
          >
            <div className="workflowAvatars flexRow">
              <i
                className={cx(
                  'workflowAvatar',
                  (!item.appId &&
                    !item.selectNodeId &&
                    !_.includes([APP_TYPE.PROCESS, APP_TYPE.CALENDAR], item.appType)) ||
                    (_.includes(
                      [APP_TYPE.PROCESS, APP_TYPE.EXTERNAL_USER, APP_TYPE.GLOBAL_VARIABLE, APP_TYPE.CALENDAR],
                      item.appType,
                    ) &&
                      !(item.fields || []).length)
                    ? 'BGGray'
                    : bgClassName,
                  getIcons(item.typeId, item.appType, item.actionId),
                )}
              />
            </div>
            <NodeOperate nodeClassName={bgClassName} {...this.props} />
            <div className="workflowContent">
              {isSimple ? <span className="pLeft8 pRight8 Gray_9e">{_l('加载中...')}</span> : this.renderContent()}
            </div>
          </div>
          <CreateNode {...this.props} />
        </section>
      </div>
    );
  }
}
