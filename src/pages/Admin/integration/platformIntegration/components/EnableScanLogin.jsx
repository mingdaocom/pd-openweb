import React, { Fragment, useState } from 'react';
import { Switch, Support } from 'ming-ui';
import workWeiXinAjax from 'src/api/workWeiXin';
import SettingIconAndName from '../../../components/SettingIconAndName';
import workWxIcon from '../images/workwx.png';
import dingIcon from '../images/ding.png';
import feishuIcon from '../images/feishu.png';

const integrationText = { 1: _l('钉钉'), 3: _l('企业微信'), 6: _l('飞书'), 7: 'Lark' };
const integrationIcon = { 1: dingIcon, 3: workWxIcon, 6: feishuIcon };

export default function EnableScanLogin(props) {
  const {
    integrationType,
    projectId,
    disabled,
    href,
    customNameIcon = {},
    customDoc,
    updateScanEnabled = () => {},
    updateCustomNameIcon = () => {},
  } = props;
  const [scanEnabled, setScanEnabled] = useState(props.scanEnabled || false);

  const handleChangeScanEnabled = checked => {
    workWeiXinAjax
      .editThirdPartyIntergrationScanEnabled({
        projectId: projectId,
        status: checked ? 0 : 1,
        projectIntergrationType: integrationType === 7 ? 6 : integrationType,
      })
      .then(res => {
        if (res) {
          setScanEnabled(!checked);
          updateScanEnabled(!checked);
        }
      });
  };

  const saveCustomName = ({ name, icon, iconUrl, success = () => {} }) => {
    workWeiXinAjax
      .editThirdPartyCustomNameIcon({
        projectId,
        projectIntergrationType: integrationType === 7 ? 6 : integrationType,
        name,
        icon,
      })
      .then(res => {
        if (res) {
          success();
          updateCustomNameIcon({ name, icon, iconUrl });
          alert(_l('修改成功'));
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
      {customDoc ? (
        <Support
          className="mTop16 Font14"
          text={_l('如何实现企业微信扫码登录？')}
          type={3}
          href="https://help.mingdao.com/wecom/ways-login-HAP#scan-code-login"
        />
      ) : (
        <a target="_blank" href={href} className="helpEntry">
          {_l(`如何实现%0扫码登录？`, integrationText[integrationType])}
        </a>
      )}

      {scanEnabled && (
        <SettingIconAndName
          className="mTop20"
          iconClassName={`iconBg ${
            integrationType === 1 ? 'dingIcon' : [6, 7].includes(integrationType) ? 'feishuIcon' : 'workWxIcon'
          }`}
          defaultName={_l('%0登录', integrationText[integrationType])}
          name={customNameIcon.name}
          iconUrl={customNameIcon.iconUrl}
          defaultIcon={integrationIcon[integrationType]}
          handleSave={saveCustomName}
        />
      )}
    </Fragment>
  );
}
