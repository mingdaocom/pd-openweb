import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import { CreateNode, NodeOperate } from '../components';
import { TRIGGER_ID_TYPE } from '../../enum';

export default class Formula extends Component {
  constructor(props) {
    super(props);
  }

  /**
   * 渲染内容
   */
  renderContent() {
    const { item } = this.props;
    let {
      fieldValue = '',
      fieldControlName = '',
      formulaValue,
      formulaMap,
      actionId,
      isException,
      selectNodeId,
      selectNodeName,
    } = item;

    if (
      (actionId !== TRIGGER_ID_TYPE.TOTAL_STATISTICS && !formulaValue) ||
      (actionId === TRIGGER_ID_TYPE.TOTAL_STATISTICS && !selectNodeId)
    ) {
      return <div className="pLeft8 pRight8 blue">{_l('设置此节点')}</div>;
    }

    if (actionId === TRIGGER_ID_TYPE.TOTAL_STATISTICS) {
      if (!selectNodeName) {
        return (
          <div className="pLeft8 pRight8 red">
            <i className="icon-workflow_info Font18 mRight5" />
            {_l('指定的节点对象已删除')}
          </div>
        );
      }

      return <div className="pLeft8 pRight8 ellipsis Gray_75">{_l('统计数据条数')}</div>;
    }

    if (isException) {
      return (
        <div className="pLeft8 pRight8 yellow">
          <i className="icon-workflow_error Font18 mRight5" />
          {_l('运算值存在异常')}
        </div>
      );
    }

    if (actionId !== TRIGGER_ID_TYPE.DATE_DIFF_FORMULA) {
      const arr = formulaValue.match(/\$.*?\$/g);
      if (arr) {
        arr.forEach(obj => {
          formulaValue = formulaValue.replace(obj, formulaMap[obj.replace(/\$/g, '').split('-')[1]].name);
        });
      }
      formulaValue = formulaValue
        .replace(/\+/g, ' + ')
        .replace(/\-/g, ' - ')
        .replace(/\*/g, ' * ')
        .replace(/\//g, ' / ');
    }

    return (
      <Fragment>
        <div className="pLeft8 pRight8">
          <span className="Gray_75">
            {actionId === TRIGGER_ID_TYPE.FUNCTION_CALCULATION ? _l('计算：') : _l('运算：')}
          </span>
          {fieldValue + fieldControlName + formulaValue}
        </div>
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
              {
                errorShadow: (!!item.formulaValue && item.isException) || (item.selectNodeId && !item.selectNodeName),
              },
              { active: selectNodeId === item.id },
            )}
            onMouseDown={() => !disabled && openDetail(item.id, item.typeId)}
          >
            <div className="workflowAvatars flexRow">
              <i
                className={cx(
                  'workflowAvatar icon-workflow_function',
                  item.formulaValue || item.selectNodeId ? 'BGBlueAsh' : 'BGGray',
                )}
              />
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
