import React, { Fragment, useState } from 'react';
import { Switch } from 'ming-ui';
import workWeiXinAjax from 'src/api/workWeiXin';

const integrationText = {
  1: _l('钉钉'),
  3: _l('企业微信'),
  6: _l('飞书'),
};

export default function EnableScanLogin(props) {
  const { integrationType, projectId, disabled, href, updateScanEnabled = () => {} } = props;
  const [scanEnabled, setScanEnabled] = useState(props.scanEnabled || false);

  const handleChangeScanEnabled = checked => {
    workWeiXinAjax
      .editThirdPartyIntergrationScanEnabled({
        projectId: projectId,
        status: checked ? 0 : 1,
        projectIntergrationType: integrationType,
      })
      .then(res => {
        if (res) {
          setScanEnabled(!checked);
          updateScanEnabled(!checked);
        }
      });
  };

  return (
    <Fragment>
      <h3 className="stepTitle Font16 Gray mBottom24">{_l(`%0扫码登录`, integrationText[integrationType])}</h3>
      <Switch disabled={disabled} checked={scanEnabled} onClick={handleChangeScanEnabled} />
      <div className="mTop16 syncBox">
        <span className="Font14 Gray_75">
          {_l(`开启后，在二级域名下使用%0扫一扫，直接登录`, integrationText[integrationType])}
        </span>
      </div>
      <a target="_blank" href={href} className="helpEntry">
        {_l(`如何实现%0扫码登录？`, integrationText[integrationType])}
      </a>
    </Fragment>
  );
}
