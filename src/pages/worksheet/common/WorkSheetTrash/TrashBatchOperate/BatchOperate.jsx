import React, { Compoennt } from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import PropTypes from 'prop-types';
import IconText from '../../../components/IconText';
import './BatchOperate.less';

export default function BatchOperate(props) {
  const { isCharge, selectedLength, onRestore, onHardDelete, onCancel, entityName } = props;
  return (
    <ReactCSSTransitionGroup
      transitionName="trashBatchOperateCon"
      transitionEnterTimeout={500}
      transitionLeaveTimeout={300}
    >
      {!!selectedLength && (
        <div className="trashBatchOperateCon">
          <span className="selectedStatus Font14">{_l('已选择 %0 条%1', selectedLength, entityName)}</span>
          <IconText className="restore" icon="reply" text={_l('恢复')} onClick={onRestore} />
          {isCharge && <IconText className="delete" icon="delete2" text={_l('彻底删除')} onClick={onHardDelete} />}
          <span className="Right cancelSelect ThemeColor3 Hand Font14" onClick={onCancel}>
            {_l('取消')}
          </span>
        </div>
      )}
    </ReactCSSTransitionGroup>
  );
}

BatchOperate.propTypes = {
  selectedLength: PropTypes.number,
  onRestore: PropTypes.func,
  onHardDelete: PropTypes.func,
  onCancel: PropTypes.func,
};
