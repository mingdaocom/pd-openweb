import React from 'react';
import './errorPage.less';

export default ({ isSeriousError }) => {
  if (isSeriousError === false) {
    return (
      <div className="programErrorMinBox flexColumn ThemeBGColor9 flex">
        <i className="icon-task-setting_promet Font56" />
        <div className="Font14 mTop20">{_l('程序错误，请刷新页面重试')}</div>
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
      </div>
    </div>
  );
};
