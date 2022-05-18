import React, { Component } from 'react';
import cx from 'classnames';
import { CreateNode, NodeOperate } from '../components';
import { ACTION_ID } from '../../enum';

export default class PBC extends Component {
  constructor(props) {
    super(props);
  }

  /**
   * 渲染内容
   */
  renderContent() {
    const { item } = this.props;
    const isPBCExport = item.actionId === ACTION_ID.PBC_OUT;

    if (!item.appId) {
      return <div className="pLeft8 pRight8 blue">{_l('设置此节点')}</div>;
    }

    if (item.appId && !item.appName && !isPBCExport) {
      return (
        <div className="pLeft8 pRight8 red">
          <i className="icon-workflow_info Font18 mRight5" />
          {_l('指定的业务流程已删除')}
        </div>
      );
    }

    if (isPBCExport) {
      return <div className="workflowContentInfo ellipsis">{_l('%0个输出参数', item.count)}</div>;
    }

    return (
      <div className="pLeft8 pRight8 flexRow" style={{ alignItems: 'center' }}>
        <div className="ellipsis">
          <span className="Gray_75">{_l('调用业务流程：')}</span>
          {item.appName}
        </div>
        <i className="mLeft5 icon-task-new-detail Font12 ThemeColor3 ThemeHoverColor2" onMouseDown={this.openProcess} />
        <div className="flex" />
      </div>
    );
  }

  openProcess = evt => {
    const { item } = this.props;

    evt.stopPropagation();
    window.open(`/workflowedit/${item.appId}`);
  };

  render() {
    const { item, disabled, selectNodeId, openDetail } = this.props;
    const isPBCExport = item.actionId === ACTION_ID.PBC_OUT;

    return (
      <div className="flexColumn">
        <section className="workflowBox" data-id={item.id}>
          <div
            className={cx(
              'workflowItem',
              { workflowItemDisabled: disabled },
              { errorShadow: item.appId && item.isException },
              { active: selectNodeId === item.id },
            )}
            onMouseDown={() => !disabled && openDetail(item.id, item.typeId)}
          >
            <div className="workflowAvatars flexRow">
              <i
                className={cx(
                  'workflowAvatar',
                  isPBCExport ? 'icon-output' : 'icon-pbc',
                  item.appId ? 'BGBlueAsh' : 'BGGray',
                )}
              />
            </div>
            <NodeOperate nodeClassName="BGBlueAsh" {...this.props} noDelete={isPBCExport} noCopy={isPBCExport} />
            <div className="workflowContent Font13">{this.renderContent()}</div>
          </div>
          <CreateNode {...this.props} disabled={isPBCExport} />
        </section>
      </div>
    );
  }
}
