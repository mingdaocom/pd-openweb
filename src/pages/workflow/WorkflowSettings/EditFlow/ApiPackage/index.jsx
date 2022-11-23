import React, { Component } from 'react';
import cx from 'classnames';
import { CreateNode, NodeOperate } from '../components';

export default class ApiPackage extends Component {
  constructor(props) {
    super(props);
  }

  /**
   * 渲染内容
   */
  renderContent() {
    const { item } = this.props;

    if (!item.appId) {
      return <div className="pLeft8 pRight8 blue">{_l('设置此节点')}</div>;
    }

    if (item.appId && !item.appName) {
      return (
        <div className="pLeft8 pRight8 yellow">
          <i className="icon-workflow_error Font18 mRight5" />
          {_l('API 连接与认证已错误')}
        </div>
      );
    }

    return (
      <div className="pLeft8 pRight8 flexRow" style={{ alignItems: 'center' }}>
        <div className="ellipsis">{item.appName}</div>
        <i
          className="mLeft5 icon-task-new-detail Font12 ThemeColor3 ThemeHoverColor2"
          onMouseDown={this.openApiPackage}
        />
        <div className="flex" />
      </div>
    );
  }

  openApiPackage = evt => {
    const { item, companyId } = this.props;

    evt.stopPropagation();
    window.open(`/integrationConnect/${companyId}/${item.appId}`);
  };

  render() {
    const { processId, item, disabled, selectNodeId, openDetail } = this.props;

    return (
      <div className="flexColumn">
        <section className="workflowBox" data-id={item.id}>
          <div
            className={cx(
              'workflowItem',
              { workflowItemDisabled: disabled },
              { errorShadow: item.appId && !item.appName },
              { active: selectNodeId === item.id },
            )}
            onMouseDown={() => !disabled && openDetail(processId, item.id, item.typeId)}
          >
            <div className="workflowAvatars flexRow">
              <i className={cx('workflowAvatar icon-connect', item.appId ? 'BGBlueAsh' : 'BGGray')} />
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
