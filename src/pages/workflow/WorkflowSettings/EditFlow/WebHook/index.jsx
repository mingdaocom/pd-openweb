import React, { Component } from 'react';
import cx from 'classnames';
import { CreateNode, NodeOperate } from '../components';
import { APP_TYPE } from '../../enum';

export default class Write extends Component {
  constructor(props) {
    super(props);
  }

  /**
   * 渲染内容
   */
  renderContent() {
    const { item } = this.props;

    if (item.appType === APP_TYPE.SHEET && !item.selectNodeId) {
      return <div className="pLeft8 pRight8 blue">{_l('设置此节点')}</div>;
    }

    if (item.appType === APP_TYPE.SHEET && !item.selectNodeName) {
      return (
        <div className="pLeft8 pRight8 red">
          <i className="icon-workflow_info Font18 mRight5" />
          {_l('指定的节点对象已删除')}
        </div>
      );
    }

    if (item.appType === APP_TYPE.SHEET) {
      return <div className="pLeft8 pRight8 ellipsis Gray_75">{_l('发送指定数据对象')}</div>;
    }

    if (item.count) {
      return (
        <div className="pLeft8 pRight8 ellipsis Gray_75">
          <span className="Gray_75">{_l('已配置：')}</span>
          {_l('%0个返回值', item.count)}
        </div>
      );
    }

    return <div className="pLeft8 pRight8 ellipsis Gray_75">{_l('发送自定义请求')}</div>;
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
              { errorShadow: item.selectNodeId && item.isException },
              { active: selectNodeId === item.id },
            )}
            onMouseDown={() => !disabled && openDetail(item.id, item.typeId)}
          >
            <div className="workflowAvatars flexRow">
              <i className={cx('workflowAvatar icon-workflow_webhook', item.webhookUrl ? 'BGBlueAsh' : 'BGGray')} />
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
