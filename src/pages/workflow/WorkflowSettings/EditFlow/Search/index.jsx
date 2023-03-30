import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import { CreateNode, NodeOperate } from '../components';
import { ACTION_ID } from '../../enum';

export default class Search extends Component {
  constructor(props) {
    super(props);
  }

  /**
   * 渲染内容
   */
  renderContent() {
    const { item } = this.props;

    if (!item.appId && !item.selectNodeId) {
      return <div className="pLeft8 pRight8 blue">{_l('设置此节点')}</div>;
    }

    if (item.appId && !item.appName) {
      return (
        <div className="pLeft8 pRight8 red">
          <i className="icon-workflow_info Font18 mRight5" />
          {_l('工作表已删除')}
        </div>
      );
    }

    if (item.selectNodeId && !item.selectNodeName) {
      return (
        <div className="pLeft8 pRight8 red">
          <i className="icon-workflow_info Font18 mRight5" />
          {_l('指定的节点对象已删除')}
        </div>
      );
    }

    if (item.selectNodeId) {
      return (
        <div className="pLeft8 pRight8 ellipsis">
          {_l('从多条数据节点获取')}
          <span>{item.executeType === 0 ? _l('，无结果时中止或执行查找结果分支') : _l('，无结果时继续执行')}</span>
        </div>
      );
    }

    return (
      <Fragment>
        <div className="workflowContentInfo ellipsis workflowContentBG">
          <span className="Gray_75">{_l('工作表')}</span>“{item.appName}”
        </div>
        <div className="workflowContentInfo ellipsis Gray_75 mTop4 pBottom5">
          {item.actionId === ACTION_ID.WORKSHEET_FIND ? _l('从工作表获得') : _l('从记录链接获得')}
          {item.executeType === 0 && <span>{_l('，无结果时中止或执行查找结果分支')}</span>}
          {item.executeType === 1 && <span>{_l('，无结果时新增记录')}</span>}
          {item.executeType === 2 && <span>{_l('，无结果时继续执行')}</span>}
        </div>
      </Fragment>
    );
  }

  render() {
    const { processId, item, disabled, selectNodeId, openDetail, approvalSelectNodeId } = this.props;

    return (
      <div className="flexColumn">
        <section className="workflowBox" data-id={item.id}>
          <div
            className={cx(
              'workflowItem',
              { workflowItemDisabled: disabled },
              { errorShadow: (item.appId || item.selectNodeId) && item.isException },
              { active: selectNodeId === item.id },
            )}
            onMouseDown={() => !disabled && openDetail(processId, item.id, item.typeId, approvalSelectNodeId)}
          >
            <div className="workflowAvatars flexRow">
              <i className={cx('workflowAvatar icon-search', item.appId ? 'BGYellow' : 'BGGray')} />
            </div>
            <NodeOperate nodeClassName="BGYellow" {...this.props} />
            <div className="workflowContent Font13">{this.renderContent()}</div>
          </div>
          {item.resultTypeId ? <div className="workflowLineBtn" /> : <CreateNode {...this.props} />}
        </section>
      </div>
    );
  }
}
