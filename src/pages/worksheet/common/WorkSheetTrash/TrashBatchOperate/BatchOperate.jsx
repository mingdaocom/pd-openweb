import React, { useState } from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import { Dialog } from 'ming-ui';
import PropTypes from 'prop-types';
import IconText from '../../../components/IconText';
import './BatchOperate.less';

export default function BatchOperate(props) {
  const { isAll, isCharge, selectedLength, onRestore, onHardDelete, onCancel, entityName } = props;
  const [state, setState] = useState({});
  const { select1000 } = state;
  return (
    <ReactCSSTransitionGroup
      transitionName="trashBatchOperateCon"
      transitionEnterTimeout={500}
      transitionLeaveTimeout={300}
    >
      {!!selectedLength && (
        <div className="trashBatchOperateCon">
          <span className="selectedStatus Font14">
            {isAll
              ? _l(select1000 ? '已选择 1000 条数据' : `已选择”全部“所有 %0 条%1`, selectedLength, entityName)
              : _l('已选择本页 %0 条%1', selectedLength, entityName)}
          </span>
          <IconText
            className="restore"
            icon="reply"
            text={_l('恢复')}
            onClick={() => {
              if (selectedLength > 1000) {
                Dialog.confirm({
                  title: (
                    <span style={{ fontWeight: 500, lineHeight: '1.5em' }}>
                      {_l('最大支持批量恢复1000条记录，是否只选中并恢复前1000条数据？')}
                    </span>
                  ),
                  onOk: () => {
                    setState({ ...state, select1000: true });
                    onRestore();
                  },
                });
              } else {
                onRestore();
              }
            }}
          />
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
