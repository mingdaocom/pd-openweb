import React, { Component } from 'react';
import cx from 'classnames';
import { ACTION_ID } from '../../enum';
import { CreateNode, NodeOperate, WhiteNode } from '../components';

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
          <i className="icon-report Font18 mRight5" />
          {_l('指定的业务流程已删除')}
        </div>
      );
    }

    if (isPBCExport) {
      return <div className="workflowContentInfo ellipsis">{_l('%0个输出参数', item.count)}</div>;
    }

    return (
      <div className="pLeft8 pRight8 flexRow alignItemsCenter">
        <div className="ellipsis">
          <span className="Gray_75">{_l('调用封装业务流程：')}</span>
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
    const { processId, item, disabled, selectNodeId, openDetail, isSimple, isCopy, isPlugin } = this.props;
    const isPBCExport = item.actionId === ACTION_ID.PBC_OUT;

    if (isPlugin) {
      return (
        <WhiteNode
          nodeId={item.id}
          nodeName={_l('输出参数')}
          nodeDesc={_l('设置输出参数')}
          isComplete={item.appId}
          isCopy={isCopy}
          hasError={item.appId && item.isException}
          isActive={selectNodeId === item.id}
          onClick={() => openDetail(processId, item.id, item.typeId)}
        />
      );
    }

    return (
      <div className="flexColumn">
        <section className="workflowBox" data-id={item.id}>
          <div
            className={cx(
              'workflowItem',
              { workflowItemDisabled: disabled || (isCopy && isPBCExport) },
              { errorShadow: item.appId && item.isException },
              { active: selectNodeId === item.id },
            )}
            onMouseDown={() => !disabled && openDetail(processId, item.id, item.typeId)}
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
            <div className="workflowContent Font13">
              {isSimple ? <span className="pLeft8 pRight8 Gray_75">{_l('加载中...')}</span> : this.renderContent()}
            </div>
          </div>
          <CreateNode {...this.props} disabled={isPBCExport} />
        </section>
      </div>
    );
  }
}
