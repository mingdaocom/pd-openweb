import React, { useState } from 'react';
import copy from 'copy-to-clipboard';
import './errorPage.less';

function getErrorStr(errorData) {
  try {
    return `error occurred:${errorData.componentStack}
${errorData.error.message}
${errorData.error.stack}`;
  } catch (err) {
    console.log(err);
    return 'parse error fail!';
  }
}

export default ({ isSeriousError, errorData = {} }) => {
  const [errorVisible, setErrorVisible] = useState();
  if (isSeriousError === false) {
    return (
      <div className="programErrorMinBox flexColumn ThemeBGColor9 flex">
        <i className="icon-error1 Font56" />
        <div className="Font14 mTop20">{_l('程序错误，请刷新页面重试')}</div>
        {errorVisible && (
          <div className="errorPageErrorLog">
            <span
              className="copy"
              onClick={() => {
                copy(getErrorStr(errorData));
                alert(_l('程序错误信息复制成功'));
              }}
            >
              {_l('复制')}
            </span>
            <br />
            {getErrorStr(errorData)}
          </div>
        )}
        <div className="errorPageShowError" onClick={() => setErrorVisible(true)}></div>
      </div>
    );
  }

  return (
    <div className="programErrorBox  flex">
      <div className="programError flexColumn">
        <div className="programErrorImg" />
        <div className="Font20 mTop20">{_l('程序错误，请刷新页面重试')}</div>
        <div className="Font13 mTop10 Gray_9e">{_l('如刷新后仍无法解决，请联系客服汇报错误')}</div>
        <div
          className="Font14 ThemeBGColor3 ThemeHoverBGColor2 programRefresh mTop25 pointer"
          onClick={() => location.reload()}
        >
          {_l('刷新')}
        </div>
        {errorVisible && (
          <div className="errorPageErrorLog">
            <span
              className="copy"
              onClick={() => {
                copy(getErrorStr(errorData));
                alert(_l('程序错误信息复制成功'));
              }}
            >
              {_l('复制')}
            </span>
            <br />
            {getErrorStr(errorData)}
          </div>
        )}
        <div className="errorPageShowError" onClick={() => setErrorVisible(true)}></div>
      </div>
    </div>
  );
};
