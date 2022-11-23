import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import { CreateNode, NodeOperate } from '../components';
import { PUSH_LIST } from '../../enum';

export default class Push extends Component {
  constructor(props) {
    super(props);
  }

  /**
   * 渲染内容
   */
  renderContent() {
    const { item } = this.props;

    if (!item.pushType) {
      return <div className="pLeft8 pRight8 blue">{_l('设置此节点')}</div>;
    }

    return (
      <Fragment>
        <div className="pLeft8 pRight8 ellipsis">{PUSH_LIST.find(o => o.value === item.pushType).text}</div>
      </Fragment>
    );
  }

  render() {
    const { processId, item, disabled, selectNodeId, openDetail } = this.props;

    return (
      <div className="flexColumn">
        <section className="workflowBox" data-id={item.id}>
          <div
            className={cx(
              'workflowItem',
              { workflowItemDisabled: disabled },
              { active: selectNodeId === item.id },
              { errorShadow: item.selectNodeId && item.isException },
            )}
            onMouseDown={() => !disabled && openDetail(processId, item.id, item.typeId)}
          >
            <div className="workflowAvatars flexRow">
              <i className={cx('workflowAvatar icon-interface_push', item.pushType ? 'BGBlue' : 'BGGray')} />
            </div>
            <NodeOperate nodeClassName="BGBlue" {...this.props} />
            <div className="workflowContent Font13">{this.renderContent()}</div>
          </div>
          <CreateNode {...this.props} />
        </section>
      </div>
    );
  }
}
