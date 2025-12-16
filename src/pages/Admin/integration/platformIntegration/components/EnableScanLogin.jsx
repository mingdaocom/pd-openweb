import React, { Fragment, useState } from 'react';
import { Support, Switch } from 'ming-ui';
import workWeiXinAjax from 'src/api/workWeiXin';
import SettingIconAndName from '../../../components/SettingIconAndName';
import dingIcon from '../images/ding.png';
import feishuIcon from '../images/feishu.png';
import workWxIcon from '../images/workwx.png';

const integrationIcon = { 1: dingIcon, 3: workWxIcon, 6: feishuIcon };
const integrationText = {
  1: {
    title: _l('钉钉扫码登录'),
    subTitle: _l('开启后，在二级域名下使用钉钉扫一扫，直接登录'),
    hrefTxt: _l('如何实现钉钉扫码登录'),
    defaultName: _l('钉钉登录'),
  },
  3: {
    title: _l('企业微信扫码登录'),
    subTitle: _l('开启后，在二级域名下使用企业微信扫一扫，直接登录'),
    hrefTxt: _l('如何实现企业微信扫码登录'),
    defaultName: _l('企业微信登录'),
  },
  6: {
    title: _l('飞书扫码登录'),
    subTitle: _l('开启后，在二级域名下使用飞书扫一扫，直接登录'),
    hrefTxt: _l('如何实现飞书扫码登录'),
    defaultName: _l('飞书登录'),
  },
  7: {
    title: _l('Lark扫码登录'),
    subTitle: _l('开启后，在二级域名下使用Lark扫一扫，直接登录'),
    hrefTxt: _l('如何实现Lark扫码登录'),
    defaultName: _l('Lark登录'),
  },
};

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
      <h3 className="stepTitle Font16 Gray mBottom24">{(integrationText[integrationType] || {}).title}</h3>
      <Switch disabled={disabled} checked={scanEnabled} onClick={handleChangeScanEnabled} />
      <div className="mTop16 syncBox">
        <span className="Font14 Gray_75">{(integrationText[integrationType] || {}).subTitle}</span>
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
          {(integrationText[integrationType] || {}).hrefTxt}
        </a>
      )}

      {scanEnabled && (
        <SettingIconAndName
          className="mTop20"
          iconClassName={`iconBg ${
            integrationType === 1 ? 'dingIcon' : [6, 7].includes(integrationType) ? 'feishuIcon' : 'workWxIcon'
          }`}
          defaultName={(integrationText[integrationType] || {}).defaultName}
          name={customNameIcon.name}
          iconUrl={customNameIcon.iconUrl}
          defaultIcon={integrationIcon[integrationType]}
          handleSave={saveCustomName}
        />
      )}
    </Fragment>
  );
}
