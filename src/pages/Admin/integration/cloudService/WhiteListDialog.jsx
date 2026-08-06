import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Button, Dialog, LoadDiv } from 'ming-ui';
import apiKeyAjax from 'src/pages/Admin/api/cloudApi/apiKey';

const WhiteListDialogContent = styled.div`
  .whiteListTip {
    color: var(--color-text-secondary);
    font-size: 13px;
    line-height: 20px;
    margin-bottom: 12px;
  }

  .whiteListTextarea {
    width: 100%;
    height: 380px;
    border: 1px solid var(--color-border-primary);
    border-radius: 4px;
    padding: 10px 12px;
    font-size: 14px;
    line-height: 22px;
    resize: none;
    outline: none;

    &:focus {
      border-color: var(--color-primary);
    }
  }
`;

const IPV4_REG = /^((2[0-4]\d|25[0-5]|[01]?\d\d?)\.){3}(2[0-4]\d|25[0-5]|[01]?\d\d?)$/;
const CIDR_REG = /^((2[0-4]\d|25[0-5]|[01]?\d\d?)\.){3}(2[0-4]\d|25[0-5]|[01]?\d\d?)\/([0-9]|[1-2]\d|3[0-2])$/;

export default function WhiteListDialog({ visible, apiKeyId, onSave, onCancel }) {
  const [whiteListValue, setWhiteListValue] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && apiKeyId) {
      setLoading(true);
      apiKeyAjax
        .keysIpWhitelistGet({ apiKeyId })
        .then(res => {
          setWhiteListValue((res.ipWhitelist || []).join('\n'));
        })
        .finally(() => {
          setLoading(false);
        });
    }
    if (!visible) {
      setWhiteListValue('');
    }
  }, [visible, apiKeyId]);

  const handleSave = () => {
    const ipWhitelist = whiteListValue
      .split(/[\n,]+/)
      .map(s => s.trim())
      .filter(Boolean);

    if (ipWhitelist.length > 100) {
      alert(_l('白名单最多支持 100 条'), 2);
      return;
    }

    const isValid = ipWhitelist.every(ip => IPV4_REG.test(ip) || CIDR_REG.test(ip));
    if (!isValid) {
      alert(_l('请输入正确的 IP 地址或 CIDR 网段'), 2);
      return;
    }

    apiKeyAjax.keysIpWhitelistSave({ apiKeyId, ipWhitelist }).then(() => {
      alert(_l('保存成功'));
      onCancel();
      onSave();
    });
  };

  return (
    <Dialog
      width={760}
      className="cloudServiceWhiteListDialog"
      visible={visible}
      title={_l('IP 白名单')}
      onCancel={onCancel}
      footer={
        <div className="flexRow alignItemsCenter">
          <div className="flex"></div>
          <Button type="link" onClick={onCancel}>
            {_l('取消')}
          </Button>
          <Button type="primary" onClick={handleSave}>
            {_l('保存')}
          </Button>
        </div>
      }
    >
      <WhiteListDialogContent>
        <div className="whiteListTip">{_l('可设置多个，需要用英文字符","或换行隔开')}</div>
        {loading ? (
          <LoadDiv />
        ) : (
          <textarea
            className="whiteListTextarea"
            value={whiteListValue}
            placeholder={_l('请输入 IP 白名单')}
            onChange={e => setWhiteListValue(e.target.value)}
          />
        )}
      </WhiteListDialogContent>
    </Dialog>
  );
}
