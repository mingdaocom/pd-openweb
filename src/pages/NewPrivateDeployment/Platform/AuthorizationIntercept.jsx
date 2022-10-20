import React, { Fragment, useEffect, useState } from 'react';
import { LoadDiv, Icon, Textarea } from 'ming-ui';
import { Button } from 'antd';
import copy from 'copy-to-clipboard';
import styled from 'styled-components';
import privateGuideApi from 'src/api/privateGuide';

const Wrap = styled.div`
  .ming.Textarea {
    border-color: #DDDDDD;
    &:hover:not(:disabled),
    &:focus {
      border-color: #2196F3;
    }
  }
  .footer {
  }
`;

const AuthorizationIntercept = () => {
  const [infoLoading, setInfoLoading] = useState(true);
  const [serverInfo, setServerInfo] = useState({});
  const [licenseCode, setLicenseCode] = useState('');
  const [verifyLicenseCode, setVerifyLicenseCode] = useState('');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddPrivateKey = () => {
    if (_.isEmpty(licenseCode)) {
      setPrompt(_l('请输入密钥'));
      setVerifyLicenseCode('');
      return;
    }
    if (loading) return;
    setLoading(true);
    setVerifyLicenseCode('');
    setPrompt('');
    privateGuideApi.bindLicenseCode({
      licenseCode,
    }).then(result => {
      setVerifyLicenseCode(result);
      setLoading(false);
      if (result) {
        alert(_l('添加成功'));
        setLicenseCode('');
        setVerifyLicenseCode('');
        setTimeout(() => {
          location.reload();
        }, 1000);
      }
    }).fail(error => {
      setLoading(false);
      setPrompt(error.errorMessage);
    });
  }

  useEffect(() => {
    privateGuideApi.getServerInfo().then(data => {
      setInfoLoading(false);
      setServerInfo(data);
    });
  }, []);

  return (
    <Wrap className="privateCardWrap flexColumn">
      {infoLoading ? (
        <LoadDiv />
      ) : (
        <Fragment>
          <div className="Font24 bold mBottom18">{_l('请输入密钥')}</div>
          <div className="Font13 Gray_75 mBottom2">{_l('密钥版本')}: {serverInfo.licenseTemplateVersion}</div>
          <div className="Font13 Gray_75">
            {_l('服务器ID')}: {serverInfo.serverId}
            <Icon
              icon="copy"
              className="Gray_9e Font17 pointer"
              onClick={() => {
                copy(serverInfo.serverId);
                alert(_l('复制成功'));
              }}
            />
          </div>
          <Textarea
            className="mTop20"
            value={licenseCode}
            minHeight={250}
            maxHeight={250}
            placeholder={_l('请输入密钥')}
            onChange={(value) => {
              setLicenseCode(value);
            }}
          />
          <div className="flexRow mTop30 footer">
            <div className="flexRow valignWrapper flex">
              {
                loading ? (
                  <div className="flexRow verifyInfo Gray_75 mBottom10">
                    <LoadDiv size="small" />
                    <span className="mLeft5">{_l('正在验证您的产品密钥')}</span>
                  </div>
                ) : (
                  (_.isBoolean(verifyLicenseCode) && !verifyLicenseCode) && <div className="mBottom10 Red">{_l('密钥验证失败, 请重新填写')}</div>
                )
              }
              {prompt ? <div className="mBottom10 Red">{prompt}</div> : null}
            </div>
            <Button type="primary" onClick={handleAddPrivateKey}>{_l('确定')}</Button>
          </div>
        </Fragment>
      )}
    </Wrap>
  );
}

export default AuthorizationIntercept;
