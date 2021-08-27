import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import { CreateNode, MembersAvatar, MembersName, NodeOperate } from '../components';
export default class Notice extends Component {
  constructor(props) {
    super(props);
  }

  /**
   *
   * 渲染内容
   */
  renderContent() {
    const { item } = this.props;

    if (!item.accounts.length) {
      return <div className="pLeft8 pRight8 blue">{_l('设置此节点')}</div>;
    }

    if (item.selectNodeId && !item.selectNodeName) {
      return (
        <div className="pLeft8 pRight8 red">
          <i className="icon-workflow_info Font18 mRight5" />
          {_l('指定的发送记录已删除')}
        </div>
      );
    }

    return (
      <Fragment>
        <div className="pLeft8 pRight8 pTop5 pBottom5">
          <span className="Gray_75">{_l('通知人：')}</span>
          <MembersName accounts={item.accounts} />
        </div>
        {item.isException && (
          <div className="pLeft8 pRight8 pBottom5 yellow">
            <i className="icon-workflow_error Font18 mRight5" />
            {_l('通知内容存在异常')}
          </div>
        )}
      </Fragment>
    );
  }

  render() {
    const { item, disabled, selectNodeId, openDetail } = this.props;

    return (
      <div className="flexColumn">
        <section className="workflowBox" data-id={item.id}>
          <div
            className={cx(
              'workflowItem',
              { workflowItemDisabled: disabled },
              { errorShadow: !!item.accounts.length && item.isException },
              { active: selectNodeId === item.id },
            )}
            onMouseDown={() => !disabled && openDetail(item.id, item.typeId)}
          >
            <div className="workflowAvatars flexRow">
              <MembersAvatar accounts={item.accounts} type={item.typeId} />
            </div>
            <NodeOperate nodeClassName="BGBlue" {...this.props} />
            <div className="workflowContent">{this.renderContent()}</div>
          </div>
          <CreateNode {...this.props} />
        </section>
      </div>
    );
  }
}
