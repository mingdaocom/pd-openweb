import React from 'react';
import copy from 'copy-to-clipboard';
import styled from 'styled-components';
import { FunctionWrap, PopupWrapper } from 'ming-ui';

const CopyPrintLinkPopupWrap = styled(PopupWrapper)`
  .copyPrintLinkPopupCon {
    padding: 0 15px 15px;
  }
  .copyPrintLinkPopupCopyBtn {
    width: 100%;
    height: 36px;
    line-height: 36px;
    text-align: center;
    border-radius: 18px;
    color: var(--color-white);
  }
`;

const getOpenBrowserUrl = () => {
  const url = new URL(window.location.href);

  url.searchParams.set('open_in_browser', 'true');

  if (window.isFeiShu) {
    url.searchParams.set('lk_jump_to_browser', 'true');
    url.searchParams.set('lk_mobile_jump_to_browser', 'true');
  }

  return url.href;
};

export default function CopyPrintLinkPopup(props) {
  const { visible, onClose } = props;

  const handleCopy = () => {
    copy(getOpenBrowserUrl());
    alert(_l('复制成功'), 1);
    onClose();
  };

  return (
    <CopyPrintLinkPopupWrap
      visible={visible}
      title={_l('复制打印链接')}
      className="copyPrintLinkPopup"
      bodyClassName="copyPrintLinkPopupBody"
      headerType="withIcon"
      headerTitleAlign="left"
      onClose={onClose}
    >
      <div className="copyPrintLinkPopupCon">
        <div className="Font14 mBottom16">
          {_l('当前打印服务在第三方应用内无法直接打开。请复制下方链接，并在浏览器中打开后继续使用打印功能。')}
        </div>
        <div className="copyPrintLinkPopupCopyBtn bgColorPrimary bold" onClick={handleCopy}>
          {_l('复制链接')}
        </div>
      </div>
    </CopyPrintLinkPopupWrap>
  );
}

export const openPrintPageInBrowser = () => {
  FunctionWrap(CopyPrintLinkPopup);
};
