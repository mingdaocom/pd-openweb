import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import { CreateNode, NodeOperate } from '../components';
import { ACTION_ID, APP_TYPE } from '../../enum';

export default class Action extends Component {
  constructor(props) {
    super(props);
  }

  /**
   * 渲染内容
   */
  renderContent() {
    const { item } = this.props;
    const isSheet = _.includes([APP_TYPE.SHEET, APP_TYPE.DATE, APP_TYPE.CUSTOM_ACTION], item.appType);

    if (
      (!item.appId && !item.selectNodeId && item.appType !== APP_TYPE.PROCESS) ||
      (item.appType === APP_TYPE.PROCESS && !item.fields.length)
    ) {
      return <div className="pLeft8 pRight8 blue">{_l('设置此节点')}</div>;
    }

    // 更新记录
    if (isSheet && item.actionId === ACTION_ID.EDIT) {
      if (item.selectNodeName) {
        return (
          <Fragment>
            <div className="workflowContentInfo ellipsis workflowContentBG">
              <span className="Gray_9e mRight5">{item.appTypeName}</span>“{item.appName}”
            </div>
            <div className="pLeft8 pRight8 mTop8 Gray_75">{_l('更新记录')}</div>
            {item.fields.length === 0 ? (
              <div className="pLeft8 pRight8 mTop4 yellow pBottom5">{_l('未设置可执行的动作')}</div>
            ) : (
              <div className="pLeft8 pRight8 mTop4 Gray_75 pBottom5">
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
    if (isSheet && item.actionId === ACTION_ID.ADD) {
      if (item.appName) {
        return (
          <Fragment>
            <div className="workflowContentInfo ellipsis workflowContentBG">
              <span className="Gray_9e mRight5">{item.appTypeName}</span>“{item.appName}”
            </div>
            <div className="workflowContentInfo ellipsis Gray_75 mTop4">{_l('在工作表中新增记录')}</div>
            {item.fields.length === 0 ? (
              <div className="pLeft8 pRight8 mTop4 yellow pBottom5">{_l('未设置可执行的动作')}</div>
            ) : (
              <div className="pLeft8 pRight8 mTop4 Gray_75 pBottom5">
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
    if (isSheet && item.actionId === ACTION_ID.DELETE) {
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
    if (isSheet && item.actionId === ACTION_ID.RELATION) {
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
    if (item.appType === APP_TYPE.TASK && item.actionId === ACTION_ID.ADD) {
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
  }

  render() {
    const { item, disabled, selectNodeId, openDetail } = this.props;
    const isSheet = _.includes([APP_TYPE.SHEET, APP_TYPE.DATE, APP_TYPE.CUSTOM_ACTION, APP_TYPE.PROCESS], item.appType);
    const bgClassName = isSheet ? 'BGYellow' : 'BGGreen';

    return (
      <div className="flexColumn">
        <section className="workflowBox" data-id={item.id}>
          <div
            className={cx(
              'workflowItem',
              { workflowItemDisabled: disabled },
              {
                errorShadow:
                  (((item.appId || item.selectNodeId) && item.appType !== APP_TYPE.PROCESS) ||
                    (item.appType === APP_TYPE.PROCESS && item.fields.length)) &&
                  item.isException,
              },
              { active: selectNodeId === item.id },
            )}
            onMouseDown={() => !disabled && openDetail(item.id, item.typeId)}
          >
            <div className="workflowAvatars flexRow">
              <i
                className={cx(
                  'workflowAvatar',
                  (!item.appId && !item.selectNodeId && item.appType !== APP_TYPE.PROCESS) ||
                    (item.appType === APP_TYPE.PROCESS && !item.fields.length)
                    ? 'BGGray'
                    : bgClassName,
                  {
                    'icon-workflow_update':
                      isSheet && item.actionId === ACTION_ID.EDIT && item.appType !== APP_TYPE.PROCESS,
                  },
                  { 'icon-workflow_new': isSheet && item.actionId === ACTION_ID.ADD },
                  { 'icon-hr_delete': isSheet && item.actionId === ACTION_ID.DELETE },
                  {
                    'icon-workflow_search': isSheet && item.actionId === ACTION_ID.RELATION,
                  },
                  { 'icon-custom_assignment': item.appType === APP_TYPE.TASK },
                  { 'icon-parameter': isSheet && item.appType === APP_TYPE.PROCESS },
                )}
              />
            </div>
            <NodeOperate nodeClassName={bgClassName} {...this.props} />
            <div className="workflowContent">{this.renderContent()}</div>
          </div>
          <CreateNode {...this.props} />
        </section>
      </div>
    );
  }
}
