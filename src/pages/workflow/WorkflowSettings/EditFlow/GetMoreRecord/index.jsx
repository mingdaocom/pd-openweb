import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import { CreateNode, NodeOperate } from '../components';
import { TRIGGER_ID_TYPE } from '../../enum';

export default class GetMoreRecord extends Component {
  constructor(props) {
    super(props);
  }

  /**
   * 渲染内容
   */
  renderContent() {
    const { item } = this.props;
    const text = {
      [TRIGGER_ID_TYPE.FROM_WORKSHEET]: _l('从工作表获取多条记录'),
      [TRIGGER_ID_TYPE.FROM_RECORD]: _l('从一条记录获取多条关联记录'),
      [TRIGGER_ID_TYPE.FROM_ADD]: _l('从新增记录节点获取多条记录'),
      [TRIGGER_ID_TYPE.FROM_ARRAY]: _l('从Webhook数组获取数据'),
      [TRIGGER_ID_TYPE.FROM_CODE]: _l('从代码块数组获取数据'),
      [TRIGGER_ID_TYPE.FROM_ARTIFICIAL]: _l('从人工节点获取操作明细数据'),
      [TRIGGER_ID_TYPE.FROM_PBC_ARRAY]: _l('从业务流程数组获取数据'),
    };

    if (!item.appId && !item.selectNodeId) {
      return <div className="pLeft8 pRight8 blue">{_l('设置此节点')}</div>;
    }

    if (item.isException) {
      return (
        <div className="pLeft8 pRight8 yellow">
          <i className="icon-workflow_error Font18 mRight5" />
          {_l('未配置有效参数')}
        </div>
      );
    }

    if (
      _.includes([TRIGGER_ID_TYPE.FROM_ARRAY, TRIGGER_ID_TYPE.FROM_CODE, TRIGGER_ID_TYPE.FROM_PBC_ARRAY], item.actionId)
    ) {
      return <div className="pLeft8 pRight8 ellipsis Gray_75">{text[item.actionId]}</div>;
    }

    return (
      <Fragment>
        <div className="workflowContentInfo ellipsis workflowContentBG">
          <span className="Gray_75">{_l('工作表')}</span>“{item.appName}”
        </div>
        <div className="workflowContentInfo ellipsis Gray_75 mTop4 pBottom5">{text[item.actionId]}</div>
      </Fragment>
    );
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
              { errorShadow: (item.appId || item.selectNodeId) && item.isException },
              { active: selectNodeId === item.id },
            )}
            onMouseDown={() => !disabled && openDetail(item.id, item.typeId)}
          >
            <div className="workflowAvatars flexRow">
              <i
                className={cx('workflowAvatar icon-transport', item.appId || item.selectNodeId ? 'BGYellow' : 'BGGray')}
              />
            </div>
            <NodeOperate nodeClassName="BGYellow" {...this.props} />
            <div className="workflowContent Font13">{this.renderContent()}</div>
          </div>
          <CreateNode {...this.props} />
        </section>
      </div>
    );
  }
}
