import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { NODE_TYPE } from '../../enum';
import { getFilterText } from '../../utils';
import { CreateNode, NodeOperate } from '../components';

export default class Goto extends Component {
  getValidConditionValues = conditionValues =>
    (conditionValues || []).filter(item => item && (item.controlId || !_.isUndefined(item.value)));

  renderValue(item) {
    if (item.controlId) {
      return (
        <Fragment>
          <span style={{ color: item.nodeName ? 'var(--color-text-title)' : 'var(--color-error)' }}>
            {item.nodeName || _l('节点已删除')}
          </span>
          -
          <span style={{ color: item.controlName ? 'var(--color-text-title)' : 'var(--color-error)' }}>
            {item.controlName || _l('字段已删除')}
          </span>
        </Fragment>
      );
    }

    return item.value && typeof item.value === 'object' ? item.value.value : item.value;
  }

  renderConditionValue(item) {
    if (_.includes(['15', '16'], item.conditionId)) {
      const [start = {}, end = {}] = this.getValidConditionValues(item.conditionValues);
      return (
        <span>
          {this.renderValue(start)}
          <span className="mLeft5 mRight5">~</span>
          {this.renderValue(end)}
        </span>
      );
    }

    const splitText = _.includes(['1', '3', '5', '6'], item.conditionId)
      ? _l('或')
      : _.includes(['2', '4'], item.conditionId)
        ? _l('和')
        : '';
    const conditionValues = this.getValidConditionValues(item.conditionValues);

    return (
      <span>
        {conditionValues.map((value, index) => (
          <Fragment key={index}>
            {this.renderValue(value)}
            {index !== conditionValues.length - 1 && splitText && (
              <span className="mLeft5 mRight5 textSecondary">{splitText}</span>
            )}
          </Fragment>
        ))}
      </span>
    );
  }

  renderCondition(condition, index) {
    const isOldCondition =
      (_.includes([15, 16], condition.filedTypeId) || (condition.filedTypeId === 38 && condition.enumDefault === 2)) &&
      _.includes(['15', '16', '17', '18'], condition.conditionId);

    return (
      <div key={index} className="workflowBranchItemTag">
        <span
          className="ellipsis maxWidth mRight5"
          style={{
            color: condition.nodeName && condition.filedValue ? 'var(--color-text-title)' : 'var(--color-error)',
          }}
        >
          {condition.nodeName && condition.filedValue
            ? condition.nodeType === NODE_TYPE.FORMULA
              ? condition.nodeName
              : condition.filedValue
            : _l('字段已删除')}
        </span>
        <span className="ellipsis maxWidth">
          <span className="mRight5 textSecondary">
            {getFilterText(Object.assign({}, condition, { type: condition.filedTypeId }), condition.conditionId)}
            {isOldCondition && '*'}
          </span>
          {this.renderConditionValue(condition)}
        </span>
      </div>
    );
  }

  renderConditions() {
    const { operateCondition = [] } = this.props.item;

    if (!operateCondition.length) {
      return <div className="workflowBranchItemTag textSecondary">{_l('直接跳转')}</div>;
    }

    return operateCondition.map((conditions, index) => (
      <Fragment key={index}>
        {conditions.map((condition, conditionIndex) => this.renderCondition(condition, conditionIndex))}
        {index !== operateCondition.length - 1 && (
          <div className="conditionSplit">
            <span>{_l('或')}</span>
          </div>
        )}
      </Fragment>
    ));
  }

  render() {
    const { processId, item, disabled, selectNodeId, openDetail, isSimple } = this.props;

    return (
      <div className="flexColumn">
        <section className="workflowBox pTop0" data-id={item.id}>
          <div
            className={cx('workflowItem', {
              workflowItemDisabled: disabled,
              active: selectNodeId === item.id,
              errorShadow: item.selectNodeId && item.isException,
            })}
            onMouseDown={() => !disabled && openDetail(processId, item.id, item.typeId)}
          >
            <div className="workflowName workflowBranchItem">
              <div className="flexRow mBottom4 alignItemsCenter">
                <NodeOperate {...this.props} />
              </div>
              {isSimple ? (
                <span className="pLeft8 pRight8 textSecondary">{_l('加载中...')}</span>
              ) : !item.selectNodeId ? (
                <div className="pLeft6 pRight8 colorPrimary">{_l('设置此节点')}</div>
              ) : (
                <Fragment>
                  <div className="workflowGotoTarget flexRow alignItemsCenter">
                    <span className="pLeft6 textSecondary">{_l('跳转到：')}</span>
                    <span className={cx('ellipsis', item.selectNodeName ? 'textPrimary' : 'textError')}>
                      {item.selectNodeName || _l('节点已删除')}
                    </span>
                  </div>
                  {this.renderConditions()}
                </Fragment>
              )}
            </div>
          </div>
          <CreateNode {...this.props} />
        </section>
      </div>
    );
  }
}
