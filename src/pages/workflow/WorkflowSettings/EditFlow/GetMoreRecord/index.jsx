import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import { CreateNode, NodeOperate } from '../components';
import { ACTION_ID } from '../../enum';
import _ from 'lodash';

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
      [ACTION_ID.FROM_WORKSHEET]: _l('从工作表获取多条记录'),
      [ACTION_ID.FROM_RECORD]: _l('从一条记录获取多条关联记录'),
      [ACTION_ID.FROM_ADD]: _l('从新增记录节点获取多条记录'),
      [ACTION_ID.FROM_ARRAY]: _l('从发送API请求数组获取数据'),
      [ACTION_ID.FROM_CODE_ARRAY]: _l('从代码块数组获取数据'),
      [ACTION_ID.FROM_ARTIFICIAL]: _l('从人工节点获取操作明细数据'),
      [ACTION_ID.FROM_PBC_INPUT_ARRAY]: _l('从业务流程输入数组获取数据'),
      [ACTION_ID.FROM_PBC_OUTPUT_ARRAY]: _l('从业务流程输出数组获取数据'),
      [ACTION_ID.FROM_API_ARRAY]: _l('从API数组获取数据'),
      [ACTION_ID.FROM_JSON_PARSE_ARRAY]: _l('从JSON解析数组获取数据'),
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
      _.includes(
        [
          ACTION_ID.FROM_ARRAY,
          ACTION_ID.FROM_CODE_ARRAY,
          ACTION_ID.FROM_PBC_INPUT_ARRAY,
          ACTION_ID.FROM_PBC_OUTPUT_ARRAY,
          ACTION_ID.FROM_API_ARRAY,
          ACTION_ID.FROM_JSON_PARSE_ARRAY,
        ],
        item.actionId,
      )
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
    const { processId, item, disabled, selectNodeId, openDetail } = this.props;

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
