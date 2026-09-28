import React from 'react';
import { Button, Modal } from 'ming-ui/antd-components';
import './css/reInvite.less';

// 更新日程后操作 是否弹出提示层 发送私信重新确认
export default function (confirmCallback, closeCallback) {
  const dialogId = 'calendarReInviteDialog';
  let modal;

  const handleConfirm = shouldInvite => {
    modal.destroy();
    confirmCallback(shouldInvite, true);
  };

  modal = Modal.confirm({
    wrapClassName: dialogId,
    width: 458,
    title: _l('提示'),
    footer: null,
    content: (
      <React.Fragment>
        <div className="pTop20 pBottom20 reInvitedMain1">
          <span>{_l('更新日程信息后，是否需要通知参与人员重新确认？')}</span>
        </div>
        <div className="pBottom30 reInvitedMain2">
          <Button type="primary" onClick={() => handleConfirm(false)}>
            {_l('不需要')}
          </Button>
          <Button type="primary" onClick={() => handleConfirm(true)}>
            {_l('通知重新确认')}
          </Button>
        </div>
      </React.Fragment>
    ),
    onCancel: closeCallback,
  });
}
