import React from 'react';
import { Modal } from 'ming-ui/antd-components';
import { ATTACHMENT_TYPE } from './enum';
import MobileShareDialog from './MobileShareDialog';

const DEFAULT_OPTIONS = {
  attachmentType: ATTACHMENT_TYPE.COMMON,
  file: {},
  sendToType: 1,
};

export default function openMobileShareDialog(options) {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

  return Modal.confirm({
    wrapClassName: 'sendToMobile',
    width: 540,
    title: _l('分享'),
    content: <MobileShareDialog {...mergedOptions} />,
    footer: null,
  });
}
