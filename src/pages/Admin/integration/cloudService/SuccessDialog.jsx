import React from 'react';
import copy from 'copy-to-clipboard';
import styled from 'styled-components';
import { Button, Dialog, Icon } from 'ming-ui';

const SuccessDialogContent = styled.div`
  padding: 8px 0 4px;
  min-height: 300px;
  text-align: center;

  .successIconWrap {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: var(--color-success);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-right: 10px;

    .icon {
      color: #fff;
      font-size: 16px;
      line-height: 1;
    }
  }

  .successTitle {
    font-size: 18px;
    font-weight: 600;
  }

  .successDesc {
    margin-bottom: 24px;
    line-height: 22px;
    text-align: left;
  }

  .secretName {
    font-size: 28px;
    font-weight: 600;
    margin-bottom: 16px;
  }

  .secretValue {
    width: 100%;
    height: 42px;
    border: 1px solid var(--color-border-primary);
    border-radius: 4px;
    background: var(--color-bg-primary);
    line-height: 40px;
    font-size: 14px;
    color: var(--color-text-title);
    padding: 0 12px;
    margin-bottom: 16px;
    text-align: center;
  }
`;

export default function SuccessDialog({ visible, secretInfo, onClose }) {
  const handleCopy = () => {
    if (!secretInfo.rawKey) return;
    copy(secretInfo.rawKey);
    alert(_l('复制成功'));
  };

  return (
    <Dialog
      width={520}
      className="cloudServiceCreateSuccessDialog"
      visible={visible}
      title=""
      overlayClosable={false}
      showFooter={false}
      onCancel={e => {
        if (e && (e.key === 'Escape' || e.keyCode === 27)) return;
      }}
      handleClose={onClose}
    >
      <SuccessDialogContent>
        <div className="successHeader flexRow alignItemsCenter justifyContentCenter mBottom16">
          <span className="successIconWrap">
            <Icon icon="done" />
          </span>
          <span className="successTitle">{_l('密钥创建成功')}</span>
        </div>
        <div className="successDesc">
          {_l('请妥善保存您的密钥，因为创建后将无法再次查看。如果遗失，您需要重新生成')}
        </div>
        <div className="secretName">{secretInfo.description}</div>
        <div className="secretValue">{secretInfo.rawKey}</div>
        <Button type="primary" onClick={handleCopy}>
          {_l('复制')}
        </Button>
      </SuccessDialogContent>
    </Dialog>
  );
}
