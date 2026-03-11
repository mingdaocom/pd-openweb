import React from 'react';
import DocumentTitle from 'react-document-title';
import styled from 'styled-components';

const WrapCon = styled.div`
  min-height: 400px;
`;

export default function ({ isNetwork, account, companyName, projectId, integrationAccountType, appscheme }) {
  const handleMicrosoftLogin = () => {
    const url =
      window.platformENV.isOverseas || window.platformENV.isLocal ? md.global.Config.WebUrl : location.origin + '/';
    const authPathMap = { 1: 'dingding', 6: 'feishu', 7: 'microsoft' };
    location.href =
      `${url}auth/${authPathMap[integrationAccountType]}?p=${projectId}` + (appscheme ? '&appscheme=' + appscheme : '');
  };

  return (
    <>
      <DocumentTitle title={_l('使用 Microsoft 登录')} />
      <WrapCon>
        <div className={`titleHeader flexRow alignItemsCenter Bold ${isNetwork ? 'mTop32' : 'mTop40'}`}>
          <div className="WordBreak Font26 mTop20 Bold textPrimary" style={{ WebkitBoxOrient: 'vertical' }}>
            {isNetwork ? _l('登录') : _l('请使用企业单点登录')}
          </div>
        </div>
        {!isNetwork ? (
          <div className="mTop20">
            <div className="Font15 textPrimary">
              {_l('您正在登录的账号 ')}
              <span className="Bold">{account || ''}</span>
              {_l(' 为组织 ')}
              <span className="Bold">{companyName || ''}</span>
              {_l(' 的企业单点登录账号。')}
            </div>
            <div className="Font15 textPrimary mTop16">{_l('为保证安全，该组织仅允许您通过 Microsoft 登录。')}</div>
          </div>
        ) : (
          <div className="Font15 textPrimary mTop20">{_l('请使用组织的 Microsoft 账号登录')}</div>
        )}
        <div className="tpLogin mTop32">
          <a className="Hand flexRow alignItemsCenter justifyContentCenter" onClick={handleMicrosoftLogin}>
            <i className="microsoftIcon mRight8" />
            <span className="txt flex TextCenter pRight20">{_l('使用 Microsoft 登录')}</span>
          </a>
        </div>
      </WrapCon>
    </>
  );
}
