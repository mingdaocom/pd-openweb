import React from 'react';
import { Icon } from 'ming-ui';
import { Modal } from 'ming-ui/antd-components';
import './index.less';

export default ({ onOk, onCancel, onSubmit }) => {
  return (
    <Modal
      className="addApproveWayDialog"
      open
      title={_l('加签方式')}
      mask={{ closable: true }}
      keyboard
      onCancel={onCancel}
    >
      <div className="actionWrap">
        <div
          className="action flexRow"
          onClick={() => {
            onSubmit({
              noSave: true,
              callback: err => {
                if (!err) {
                  onOk('after');
                } else {
                  onCancel();
                }
              },
            });
          }}
        >
          <div className="text flex">{_l('通过申请后增加审批人')}</div>
          <Icon icon="arrow-right-border" />
        </div>
        <div className="action flexRow" onClick={() => onOk('before')}>
          <div className="text flex">{_l('在我审批前增加审批人')}</div>
          <Icon icon="arrow-right-border" />
        </div>
      </div>
    </Modal>
  );
};
