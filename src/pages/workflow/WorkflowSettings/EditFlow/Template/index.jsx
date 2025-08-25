import React, { Component } from 'react';
import cx from 'classnames';
import { CreateNode, MembersName, NodeOperate } from '../components';

export default class Template extends Component {
  constructor(props) {
    super(props);
  }

  /**
   * 渲染内容
   */
  renderContent() {
    const { item } = this.props;

    if (!item.accounts.length) {
      return <div className="pLeft8 pRight8 blue">{_l('设置此节点')}</div>;
    }

    if (item.isException) {
      return (
        <div className="pLeft8 pRight8 red">
          <i className="icon-report Font18 mRight5" />
          {_l('未完成服务号消息设置')}
        </div>
      );
    }

    return (
      <div className="pLeft8 pRight8 pTop5 pBottom5">
        <span className="Gray_75">{_l('发送给：')}</span>
        <MembersName {...this.props} accounts={item.accounts} />
      </div>
    );
  }

  render() {
    const { processId, item, disabled, selectNodeId, openDetail, isSimple } = this.props;

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
            onMouseDown={() => !disabled && openDetail(processId, item.id, item.typeId)}
          >
            <div className="workflowAvatars flexRow">
              <i className={cx('workflowAvatar icon-wechat', item.accounts.length ? 'BGBlue' : 'BGGray')} />
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
