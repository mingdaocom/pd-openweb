import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import { CreateNode, NodeOperate } from '../components';
export default class Link extends Component {
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

    return (
      <Fragment>
        <div className="workflowContentInfo ellipsis workflowContentBG">
          <span className="Gray_75">{_l('工作表')}</span>“{item.appName}”
        </div>
        <div className={cx('workflowContentInfo ellipsis Gray_75 mTop4 pBottom5', { yellow: item.isException })}>
          {item.isException ? (
            <Fragment>
              <i className="icon-workflow_error Font18 mRight5" />
              {_l('链接名称存在异常')}
            </Fragment>
          ) : item.linkType === 1 ? (
            _l('获取记录分享链接')
          ) : (
            _l('获取记录填写链接')
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
              { errorShadow: (item.appId || item.selectNodeId) && item.isException },
              { active: selectNodeId === item.id },
            )}
            onMouseDown={() => !disabled && openDetail(processId, item.id, item.typeId)}
          >
            <div className="workflowAvatars flexRow">
              <i className={cx('workflowAvatar icon-link2', item.appId ? 'BGBlueAsh' : 'BGGray')} />
            </div>
            <NodeOperate nodeClassName="BGBlueAsh" {...this.props} />
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
