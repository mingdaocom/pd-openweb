import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import { CreateNode, NodeOperate } from '../components';
import { NODE_TYPE, TRIGGER_ID_TYPE } from '../../enum';

export default class FindSystem extends Component {
  constructor(props) {
    super(props);
  }

  /**
   * 渲染内容
   */
  renderContent() {
    const { item } = this.props;

    if (_.includes([TRIGGER_ID_TYPE.FROM_WORKSHEET, TRIGGER_ID_TYPE.WORKSHEET_FIND], item.actionId)) {
      return (
        <div className="pLeft8 pRight8">
          {NODE_TYPE.FIND_SINGLE_MESSAGE === item.typeId ? _l('从当前组织获取') : _l('从当前组织获取多条信息')}
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
          {NODE_TYPE.FIND_SINGLE_MESSAGE === item.typeId ? _l('从字段获取') : _l('从字段获取多条信息')}
          {NODE_TYPE.FIND_SINGLE_MESSAGE === item.typeId && (
            <span>{item.executeType === 0 ? _l('，无结果时中止或执行查找结果分支') : _l('，无结果时继续执行')}</span>
          )}
        </div>
      </Fragment>
    );
  }

  render() {
    const { item, disabled, selectNodeId, openDetail } = this.props;
    const isSystem = _.includes([TRIGGER_ID_TYPE.FROM_WORKSHEET, TRIGGER_ID_TYPE.WORKSHEET_FIND], item.actionId);

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
            onMouseDown={() => !disabled && openDetail(item.id, item.typeId)}
          >
            <div className="workflowAvatars flexRow">
              <i
                className={cx(
                  'workflowAvatar',
                  item.typeId === NODE_TYPE.FIND_SINGLE_MESSAGE ? 'icon-person_search' : 'icon-group-members',
                  item.selectNodeId || isSystem ? 'BGBlue' : 'BGGray',
                )}
              />
            </div>
            <NodeOperate nodeClassName="BGBlue" {...this.props} />
            <div className="workflowContent Font13">{this.renderContent()}</div>
          </div>
          <CreateNode {...this.props} />
        </section>
      </div>
    );
  }
}
