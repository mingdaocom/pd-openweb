import React from 'react';
import { Dialog, Icon } from 'ming-ui';

export default ({ onOk, onCancel, onSubmit }) => {
  return (
    <Dialog className="addApproveWayDialog" visible title={_l('加签方式')} footer={null} onCancel={onCancel}>
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
    </Dialog>
  );
};
