import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import { CreateNode, NodeOperate } from '../components';

export default class SubProcess extends Component {
  constructor(props) {
    super(props);
  }

  /**
   * 渲染内容
   */
  renderContent() {
    const { item } = this.props;

    if (!item.selectNodeId) {
      return <div className="pLeft8 pRight8 blue">{_l('设置此节点')}</div>;
    }

    if (item.selectNodeId && !item.selectNodeName) {
      return (
        <div className="pLeft8 pRight8 red">
          <i className="icon-workflow_info Font18 mRight5" />
          {_l('指定的节点对象已删除')}
        </div>
      );
    }

    return (
      <div className="pLeft8 pRight8 flexRow" style={{ alignItems: 'center' }}>
        <div className="ellipsis">
          {item.subProcessName ? (
            <Fragment>
              <span className="Gray_75">{_l('执行流程：')}</span>
              {item.subProcessName}
            </Fragment>
          ) : (
            _l('设置此节点')
          )}
        </div>
        {item.subProcessId && (
          <i
            className="mLeft5 icon-task-new-detail Font12 ThemeColor3 ThemeHoverColor2"
            onMouseDown={this.openSubProcess}
          />
        )}
        <div className="flex" />
      </div>
    );
  }

  openSubProcess = evt => {
    const { item } = this.props;

    evt.stopPropagation();
    window.open(`/workflowedit/${item.subProcessId}`);
  };

  render() {
    const { item, disabled, selectNodeId, openDetail } = this.props;

    return (
      <div className="flexColumn">
        <section className="workflowBox" data-id={item.id}>
          <div
            className={cx(
              'workflowItem',
              { workflowItemDisabled: disabled },
              { errorShadow: item.selectNodeId && item.isException },
              { active: selectNodeId === item.id },
            )}
            onMouseDown={() => !disabled && openDetail(item.id, item.typeId)}
          >
            <div className="workflowAvatars flexRow">
              <i className={cx('workflowAvatar icon-subprocess', item.selectNodeId ? 'BGBlueAsh' : 'BGGray')} />
            </div>
            <NodeOperate nodeClassName="BGBlueAsh" {...this.props} />
            <div className="workflowContent Font13">{this.renderContent()}</div>
          </div>
          <CreateNode {...this.props} />
        </section>
      </div>
    );
  }
}
