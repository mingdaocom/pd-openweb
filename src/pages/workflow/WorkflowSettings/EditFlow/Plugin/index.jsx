import React, { Component } from 'react';
import cx from 'classnames';
import { CreateNode, NodeOperate } from '../components';
import { SvgIcon } from 'ming-ui';

export default class Plugin extends Component {
  constructor(props) {
    super(props);
  }

  /**
   * 渲染内容
   */
  renderContent() {
    const { item } = this.props;

    if (item.appId && !item.appName) {
      return (
        <div className="pLeft8 pRight8 red">
          <i className="icon-workflow_error Font18 mRight5" />
          {_l('插件已删除')}
        </div>
      );
    }

    if (!(item.fields || []).length) {
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

    return <div className="workflowContentInfo ellipsis">{_l('传入%0个参数', item.fields.length)}</div>;
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
              { errorShadow: !!(item.fields || []).length && item.isException },
              { active: selectNodeId === item.id },
            )}
            onMouseDown={() => !disabled && openDetail(processId, item.id, item.typeId)}
          >
            <div className="workflowAvatars flexRow">
              {item.iconName ? (
                <span className="workflowAvatar workflowAvatarSvg" style={{ background: item.iconColor }}>
                  <SvgIcon url={item.iconName} fill="#fff" size={22} />
                </span>
              ) : (
                <i
                  className="workflowAvatar icon-workflow"
                  style={{ background: (item.fields || []).length ? item.iconColor || '#2196f3' : '#ddd' }}
                />
              )}
            </div>
            <NodeOperate nodeStyle={{ background: item.iconColor || '#2196f3' }} {...this.props} />
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
