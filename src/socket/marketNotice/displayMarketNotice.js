import React from 'react';
import { Modal, notification } from 'ming-ui/antd-components';
import { sanitizePostMessageHtml } from 'src/utils/core/sanitizeHtml';

export default function displayNotice({ noticeId, displayType, desc }) {
  const handleClose = () => {
    if (window.platformENV.isOverseas || window.platformENV.isLocal) return;
    window.mdyAPI(
      '',
      '',
      {
        accountId: md.global.Account.accountId,
        noticeId,
        type: 3,
      },
      {
        ajaxOptions: {
          type: 'GET',
          url: `${md.global.Config.MdNoticeServer}/notice/read`,
        },
      },
    );
  };

  if (desc) {
    const safeDesc = sanitizePostMessageHtml(desc);

    if (displayType === 2) {
      const modal = Modal.info({
        className: 'marketModalContainer',
        width: 720,
        centered: true,
        closable: true,
        title: null,
        icon: null,
        content: <div className="contentWrap" dangerouslySetInnerHTML={{ __html: safeDesc }}></div>,
        onCancel: handleClose,
      });
      // 保存引用 以便同步关闭
      window[`marketModal-${noticeId}`] = modal;
    } else {
      notification.open({
        className: 'marketNotificationContainer',
        title: null,
        key: noticeId,
        icon: null,
        placement: 'bottomLeft',
        bottom: 24,
        description: <div className="contentWrap" dangerouslySetInnerHTML={{ __html: safeDesc }}></div>,
        duration: null,
        onClose: handleClose,
      });
    }
  }
}
