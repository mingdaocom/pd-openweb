import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import { CreateNode, NodeOperate } from '../components';
import { ACTION_ID } from '../../enum';

export default class LoopProcess extends Component {
  constructor(props) {
    super(props);
  }

  /**
   * 渲染内容
   */
  renderContent() {
    const { item } = this.props;

    return (
      <div className="pLeft8 pRight8 flexRow alignItemsCenter">
        <div className="ellipsis">
          {item.subProcessId ? (
            <Fragment>
              <span className="Gray_75">
                {item.actionId === ACTION_ID.CONDITION_LOOP ? _l('满足条件时循环：') : _l('循环指定次数：')}
              </span>
              {item.subProcessName || <span style={{ color: '#f44336' }}>{_l('流程已删除')}</span>}
            </Fragment>
          ) : (
            _l('设置此节点')
          )}
        </div>
        {item.subProcessId && item.subProcessName && (
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
    const { processId, item, disabled, selectNodeId, openDetail, isSimple } = this.props;

    return (
      <div className="flexColumn">
        <section className="workflowBox" data-id={item.id}>
          <div
            className={cx(
              'workflowItem',
              { workflowItemDisabled: disabled },
              { errorShadow: item.subProcessId && item.isException },
              { active: selectNodeId === item.id },
            )}
            onMouseDown={() => !disabled && openDetail(processId, item.id, item.typeId)}
          >
            <div className="workflowAvatars flexRow">
              <i className="workflowAvatar icon-arrow_loop BGBlueAsh" />
            </div>
            <NodeOperate nodeClassName="BGBlueAsh" {...this.props} noCopy={true} />
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
