import React, { Fragment, useEffect, useState } from 'react';
import { LoadDiv, Icon, Textarea } from 'ming-ui';
import { Button } from 'antd';
import copy from 'copy-to-clipboard';
import styled from 'styled-components';
import privateGuideApi from 'src/api/privateGuide';
import _ from 'lodash';

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

  const url1 = `<a href="https://www.mingdao.com/register?ReturnUrl=${encodeURIComponent(`/personal?type=privatekey&v=${serverInfo.systemVersion}&ltv=${serverInfo.licenseTemplateVersion}&serverId=${serverInfo.serverId}#apply`)}" target="_blank">${_l('注册并申请')}</a>`;
  const url2 = `<a href="https://www.mingdao.com/personal?type=privatekey&v=${serverInfo.systemVersion}&ltv=${serverInfo.licenseTemplateVersion}&serverId=${serverInfo.serverId}#apply" target="_blank">${_l('登录并申请')}</a>`;
  const url3 = `<a href="https://docs.pd.mingdao.com/faq/deployment#%E5%AF%86%E9%92%A5%E4%B8%A2%E5%A4%B1%E6%9C%8D%E5%8A%A1%E5%99%A8id-%E4%B8%8D%E6%98%BE%E7%A4%BA" target="_blank">${_l('查看帮助')}</a>`;

  return (
    <Wrap className="privateCardWrap flexColumn">
      {infoLoading ? (
        <LoadDiv />
      ) : (
        <Fragment>
          <div className="Font24 bold mBottom18">{_l('请输入密钥')}</div>
          <div className="Font13 mBottom5">{_l('密钥版本：%0', serverInfo.licenseTemplateVersion)}</div>
          <div className="Font13 mBottom5">
            {_l('服务器ID：%0', serverInfo.serverId)}
            {serverInfo.serverId ? <Icon
              icon="copy"
              className="Gray_9e Font17 pointer"
              onClick={() => {
                copy(serverInfo.serverId);
                alert(_l('复制成功'));
              }}
            /> : null}
          </div>
          <div className="Gray_75 Font12 mTop5"
            dangerouslySetInnerHTML={{
              __html: !serverInfo.serverId ? _l('服务器ID不显示？%0', url3) : _l('暂无密钥？请 %0 或 %1', url1, url2),
            }}>
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
