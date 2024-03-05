import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import { CreateNode, MembersName, NodeOperate } from '../components';

export default class Write extends Component {
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

    if (!item.selectNodeName) {
      return (
        <div className="pLeft8 pRight8 red">
          <i className="icon-workflow_info Font18 mRight5" />
          {_l('指定的节点对象已删除')}
        </div>
      );
    }

    if (!item.accounts.length) {
      return (
        <div className="pLeft8 pRight8 red">
          <i className="icon-workflow_info Font18 mRight5" />
          {_l('未设置填写人')}
        </div>
      );
    }

    return (
      <Fragment>
        <div className="pLeft8 pRight8 pTop5">
          <span className="Gray_75">{_l('填写人：')}</span>
          <MembersName {...this.props} accounts={item.accounts} />
        </div>
        <div className="workflowContentInfo ellipsis mTop4 pBottom5">
          {item.formProperties.length ? (
            <span className="Gray_75">{_l('填写%0个字段', item.formProperties.length)}</span>
          ) : (
            <span className="yellow">{_l('未设置可填写字段')}</span>
          )}
        </div>
      </Fragment>
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
              { errorShadow: item.selectNodeId && item.isException },
              { active: selectNodeId === item.id },
            )}
            onMouseDown={() => !disabled && openDetail(processId, item.id, item.typeId)}
          >
            <div className="workflowAvatars flexRow">
              <i className={cx('workflowAvatar icon-workflow_write', item.selectNodeId ? 'BGSkyBlue' : 'BGGray')} />
            </div>
            <NodeOperate nodeClassName="BGSkyBlue" {...this.props} />
            <div className="workflowContent Font13">
              {isSimple ? <span className="pLeft8 pRight8 Gray_9e">{_l('加载中...')}</span> : this.renderContent()}
            </div>
          </div>
          <CreateNode {...this.props} />
        </section>
      </div>
    );
  }
}
