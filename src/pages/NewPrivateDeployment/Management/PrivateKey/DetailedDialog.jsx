import React, { useState, useEffect } from 'react';
import { Dialog, LoadDiv } from 'ming-ui';
import ClipboardButton from 'react-clipboard.js';
import styled from 'styled-components';

const Wrap = styled(Dialog)`
  .Button , .mui-dialog-close-btn, .mui-dialog-header, .mui-dialog-footer {
    display: none;
  }
  .mui-dialog-body {
    padding: 40px 24px !important;
  }
  .copy {
    color: #2196F3;
    cursor: pointer;
    margin-left: 13px;
  }
`;


export default props => {
  const { visible, serverInfo, onCancel } = props;
  return (
    <Wrap
      className="privateDeploymentDetailedDialog"
      visible={visible}
      anim={false}
      width={415}
      onCancel={onCancel}
    >
      <div className="Gray Font14 mBottom10">{_l('服务器 id')}</div>
      <div className="Font14 flexRow valignWrapper">
        <span className="Gray_75">{serverInfo.serverId}</span>
        <ClipboardButton
          className="Font14 copy"
          component="span"
          data-clipboard-text={serverInfo.serverId}
          onSuccess={() => {
            alert(_l('复制成功'));
          }}
        >
          {_l('复制')}
        </ClipboardButton>
      </div>
      <div className="Gray Font14 mBottom10 mTop30">{_l('密钥版本')}</div>
      <div className="Gray_75 Font14">{serverInfo.licenseTemplateVersion}</div>
    </Wrap>
  );
}