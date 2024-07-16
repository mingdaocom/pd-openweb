import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import { CreateNode, NodeOperate } from '../components';
import { TIME_TYPE_NAME } from '../../enum';
import moment from 'moment';

const EXECUTE_TYPE_TEXT = {
  0: _l('当天'),
  1: _l('之前'),
  2: _l('之后'),
};

export default class Delay extends Component {
  checkHasContent() {
    const { item } = this.props;
    const { timerNode } = item;

    if (!timerNode) return false;

    if (timerNode.actionId === '300') {
      return !!timerNode.fieldValue || !!timerNode.fieldControlId || !!timerNode.fieldNodeId;
    }

    return (
      !!timerNode.numberFieldValue.fieldValue ||
      !!timerNode.numberFieldValue.fieldControlId ||
      !!timerNode.hourFieldValue.fieldValue ||
      !!timerNode.hourFieldValue.fieldControlId ||
      !!timerNode.minuteFieldValue.fieldValue ||
      !!timerNode.minuteFieldValue.fieldControlId ||
      !!timerNode.secondFieldValue.fieldValue ||
      !!timerNode.secondFieldValue.fieldControlId
    );
  }

  renderDelayDateText(timerNode) {
    let { executeTimeType } = timerNode;
    const { fieldValue, fieldControlName, number, time, unit } = timerNode;
    // 若设为指定日期的前后0天则仍显示为当天
    if (!number) {
      executeTimeType = 0;
    }

    const text = executeTimeType
      ? `${EXECUTE_TYPE_TEXT[executeTimeType]} ${number} ${TIME_TYPE_NAME[unit]} ${time || ''}`
      : `${time || ''}`;

    return fieldValue ? (
      <span>{`${moment(fieldValue).format('YYYY-MM-DD')} ${text} `}</span>
    ) : (
      <span>
        <span className={cx({ red: !fieldControlName })}>{fieldControlName || _l('字段不存在')}</span> {text}
      </span>
    );
  }

  renderDelayTimeText(timerNode) {
    const { numberFieldValue, hourFieldValue, minuteFieldValue, secondFieldValue } = timerNode;
    const getDesc = ({ fieldValue, fieldControlId, fieldControlName }, label) => {
      if (!fieldValue && !fieldControlId) {
        return '';
      }

      return (
        <span className="mRight5">
          <span className={cx('mRight5', { red: fieldControlId && !fieldControlName })}>
            {fieldValue || (fieldControlName ? `{${fieldControlName}}` : _l('字段不存在'))}
          </span>
          {label}
        </span>
      );
    };

    return (
      <Fragment>
        {getDesc(numberFieldValue, _l('天'))}
        {getDesc(hourFieldValue, _l('小时'))}
        {getDesc(minuteFieldValue, _l('分钟'))}
        {getDesc(secondFieldValue, _l('秒钟'))}
      </Fragment>
    );
  }

  /**
   * 渲染内容
   */
  renderContent() {
    const { item } = this.props;
    const { timerNode } = item;

    if (!this.checkHasContent()) {
      return <div className="pLeft8 pRight8 blue">{_l('设置此节点')}</div>;
    }

    return (
      <div className="pLeft8 pRight8">
        {timerNode.actionId === '300' ? this.renderDelayDateText(timerNode) : this.renderDelayTimeText(timerNode)}
      </div>
    );
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
              { errorShadow: this.checkHasContent() && item.isException },
              { active: selectNodeId === item.id },
            )}
            onMouseDown={() => !disabled && openDetail(processId, item.id, item.typeId)}
          >
            <div className="workflowAvatars flexRow">
              <i
                className={cx('workflowAvatar icon-workflow_delayed', this.checkHasContent() ? 'BGBlueAsh' : 'BGGray')}
              />
            </div>
            <NodeOperate nodeClassName="BGBlueAsh" {...this.props} />
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
