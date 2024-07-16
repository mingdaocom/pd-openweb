import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import { CreateNode, NodeOperate } from '../components';
import { NODE_TYPE, ACTION_ID, APP_TYPE } from '../../enum';
import _ from 'lodash';

export default class FindSystem extends Component {
  constructor(props) {
    super(props);
  }

  /**
   * 渲染内容
   */
  renderContent() {
    const { item } = this.props;

    if (_.includes([ACTION_ID.FROM_WORKSHEET, ACTION_ID.WORKSHEET_FIND], item.actionId)) {
      return (
        <div className="pLeft8 pRight8">
          {item.appType === APP_TYPE.EXTERNAL_USER
            ? NODE_TYPE.FIND_SINGLE_MESSAGE === item.typeId
              ? _l('从当前应用获取')
              : _l('从当前应用获取多条信息')
            : NODE_TYPE.FIND_SINGLE_MESSAGE === item.typeId
            ? _l('从当前组织获取')
            : _l('从当前组织获取多条信息')}
        </div>
      );
    }

    if (!item.selectNodeId) {
      return <div className="pLeft8 pRight8 blue">{_l('设置此节点')}</div>;
    }

    if (item.isException) {
      return (
        <div className="pLeft8 pRight8 yellow">
          <i className="icon-workflow_error Font18 mRight5" />
          {_l('节点存在异常')}
        </div>
      );
    }

    return (
      <Fragment>
        <div className="pLeft8 pRight8 ellipsis">
          {item.appType === APP_TYPE.EXTERNAL_USER
            ? NODE_TYPE.FIND_SINGLE_MESSAGE === item.typeId
              ? _l('从外部用户字段获取')
              : _l('从外部用户字段获取多条信息')
            : NODE_TYPE.FIND_SINGLE_MESSAGE === item.typeId
            ? _l('从字段获取')
            : _l('从字段获取多条信息')}
          {NODE_TYPE.FIND_SINGLE_MESSAGE === item.typeId && (
            <span>{item.executeType === 0 ? _l('，无结果时中止或执行查找结果分支') : _l('，无结果时继续执行')}</span>
          )}
        </div>
      </Fragment>
    );
  }

  render() {
    const { processId, item, disabled, selectNodeId, openDetail, isSimple } = this.props;
    const isSystem = _.includes([ACTION_ID.FROM_WORKSHEET, ACTION_ID.WORKSHEET_FIND], item.actionId);

    return (
      <div className="flexColumn">
        <section className="workflowBox" data-id={item.id}>
          <div
            className={cx(
              'workflowItem',
              { workflowItemDisabled: disabled },
              { errorShadow: (!!item.selectNodeId || isSystem) && item.isException },
              { active: selectNodeId === item.id },
            )}
            onMouseDown={() => !disabled && openDetail(processId, item.id, item.typeId)}
          >
            <div className="workflowAvatars flexRow">
              <i
                className={cx(
                  'workflowAvatar',
                  item.appType === APP_TYPE.EXTERNAL_USER
                    ? item.typeId === NODE_TYPE.FIND_SINGLE_MESSAGE
                      ? 'icon-external_users'
                      : 'icon-folder-public'
                    : item.typeId === NODE_TYPE.FIND_SINGLE_MESSAGE
                    ? 'icon-person_search'
                    : 'icon-group-members',
                  item.selectNodeId || isSystem ? 'BGBlue' : 'BGGray',
                )}
              />
            </div>
            <NodeOperate nodeClassName="BGBlue" {...this.props} />
            <div className="workflowContent Font13">
              {isSimple ? <span className="pLeft8 pRight8 Gray_75">{_l('加载中...')}</span> : this.renderContent()}
            </div>
          </div>
          <CreateNode {...this.props} />
        </section>
      </div>
    );
  }
}
