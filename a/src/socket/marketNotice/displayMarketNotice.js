import React from 'react';
import { Modal, notification } from 'antd';

export default function displayNotice({ noticeId, displayType, desc, title }) {
  const handleClose = () => {
    $.ajax({
      dataType: 'jsonp',
      url: `${md.global.Config.MdNoticeServer}/notice/read`,
      data: {
        accountId: md.global.Account.accountId,
        noticeId,
        type: 3,
      },
      jsonp: 'jsoncallback',
    });
  };
  if (desc) {
    if (displayType === 2) {
      const modal = Modal.info({
        className: 'marketModalContainer',
        width: 720,
        centered: true,
        closable: true,
        title: null,
        icon: null,
        content: <div className="contentWrap" dangerouslySetInnerHTML={{ __html: desc }}></div>,
        onCancel: handleClose,
      });
      // 保存引用 以便同步关闭
      window[`marketModal-${noticeId}`] = modal;
    } else {
      notification.open({
        className: 'marketNotificationContainer',
        message: null,
        key: noticeId,
        icon: null,
        placement: 'bottomLeft',
        bottom: 24,
        description: <div className="contentWrap" dangerouslySetInnerHTML={{ __html: desc }}></div>,
        duration: null,
        onClose: handleClose,
      });
    }
  }
}
