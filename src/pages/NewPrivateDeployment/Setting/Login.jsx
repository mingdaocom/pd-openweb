import React, { Fragment, useState, useEffect } from 'react';
import { useSetState } from 'react-use';
import PrivateLinkDialog from './components/PrivateLinkDialog';
import { Switch, Checkbox, Radio, Icon } from 'ming-ui';
import { Button, Divider } from 'antd';
import { updateSysSettings } from '../common';
import { BrandHomeImage } from '../Platform/Brand';
import _ from 'lodash';

const Login = props => {
  const { IsPlatformLocal } = md.global.Config;
  const { SysSettings } = md.global;
  const [privateLinkDialogVisible, setPrivateLinkDialogVisible] = useState(false);

  const [
    { hideRegister, enableMobilePhoneRegister, enableEmailRegister, enableEditAccountInfo, enableDeclareRegisterConfirm, enableDeclareConfirm, enableFooterInfo, footerThemeColor },
    setData,
  ] = useSetState({
    hideRegister: SysSettings.hideRegister,
    enableMobilePhoneRegister: SysSettings.enableMobilePhoneRegister,
    enableEmailRegister: SysSettings.enableEmailRegister,
    enableEditAccountInfo: SysSettings.enableEditAccountInfo,
    enableDeclareRegisterConfirm: SysSettings.enableDeclareRegisterConfirm,
    enableDeclareConfirm: SysSettings.enableDeclareConfirm || false,
    enableFooterInfo: SysSettings.enableFooterInfo,
    footerThemeColor: SysSettings.footerThemeColor,
  });

  const changeSysSettings = (key, value) => {
    if (
      _.includes(['enableMobilePhoneRegister', 'enableEmailRegister'], key) &&
      value &&
      ((enableMobilePhoneRegister && !enableEmailRegister) || (!enableMobilePhoneRegister && enableEmailRegister))
    ) {
      alert(_l('手机号和邮箱至少选一项'), 2);
      return;
    }

    updateSysSettings(
      {
        [key]: !value,
      },
      () => {
        setData({ [key]: !value });
        md.global.SysSettings[key] = !value;
      },
    );
  };

  const renderDeclare = () => {
    return (
      <div className="flexRow">
        <div className="flex flexColumn">
          <div className="Font14 bold mBottom7">{_l('协议 / 隐私条款')}</div>
          <div className="Gray_9e mBottom15">{_l('用户在注册、登录账号时，需要同意《服务协议》和《隐私政策》')}</div>
          <Checkbox
            className="mBottom10"
            checked={enableDeclareRegisterConfirm}
            text={_l('用户注册时必须选择同意')}
            onClick={checked => changeSysSettings('enableDeclareRegisterConfirm', checked)}
          />
          <Checkbox
            checked={enableDeclareConfirm}
            text={_l('单点登录时（Web移动端），也必须先同意')}
            onClick={checked => changeSysSettings('enableDeclareConfirm', checked)}
          />
        </div>
        <div>
          <a href="/privateDeployment/lawPortal">
            {_l('在法律门户中设置')}
            <Icon className="mLeft5 Font12" icon="task-new-detail" />
          </a>
        </div>
      </div>
    );
  };

  const renderHideRegister = () => {
    return (
      <Fragment>
        <div className="flexRow">
          <div className="flex flexColumn">
            <div className="Font14 bold mBottom7">{_l('允许自注册账号')}</div>
            <div className="Gray_9e">{_l('开启后，在登录页显示注册账号入口')}</div>
          </div>
          <Switch checked={!hideRegister} onClick={value => changeSysSettings('hideRegister', !value)} />
        </div>
        {!hideRegister && (
          <div className="flexRow alignItemsCenter mTop10">
            <span className="mRight16">{_l('注册方式')}</span>
            <Checkbox
              className="mRight30"
              checked={enableMobilePhoneRegister}
              text={_l('手机号')}
              onClick={checked => changeSysSettings('enableMobilePhoneRegister', checked)}
            />
            <Checkbox
              checked={enableEmailRegister}
              text={_l('邮箱')}
              onClick={checked => changeSysSettings('enableEmailRegister', checked)}
            />
          </div>
        )}
      </Fragment>
    );
  };

  const renderAllowEditAccountInfo = () => {
    return (
      <Fragment>
        <div className="flexRow">
          <div className="flex flexColumn">
            <div className="Font14 bold mBottom7">{_l('允许用户修改账号信息')}</div>
            <div className="Gray_9e">{_l('开启后，允许用户编辑个人账户中的姓名、邮箱、手机号')}</div>
          </div>
          <Switch
            checked={enableEditAccountInfo}
            onClick={value => changeSysSettings('enableEditAccountInfo', value)}
          />
        </div>
      </Fragment>
    );
  };

  const renderFooterInfo = () => {
    return (
      <Fragment>
        <div className="flexRow mBottom20">
          <div className="flex flexColumn">
            <div className="Font14 bold mBottom7">{_l('底部信息栏')}</div>
            <div className="Gray_9e">{_l('在登录、注册页底部显示自定义链接如：法律条款、备案号等信息')}</div>
            <div className="flexRow mTop10">
              <div className="Gray_9e mRight30">{_l('颜色')}</div>
              {[{ text: _l('浅色'), value: 1 }, { text: _l('深色'), value: 2 }].map((item, index) => (
                <div className="mRight30">
                  <Radio
                    key={index}
                    text={item.text}
                    checked={footerThemeColor === item.value}
                    onClick={() => {
                      if (item.value === footerThemeColor) return;
                      updateSysSettings({ footerThemeColor: item.value }, () => {
                        md.global.SysSettings.footerThemeColor = item.value;
                        setData({ footerThemeColor: item.value });
                      });
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
          <Switch
            checked={enableFooterInfo}
            onClick={value => changeSysSettings('enableFooterInfo', value)}
          />
        </div>
        <Button ghost type="primary" style={{ width: 'max-content' }} onClick={() => setPrivateLinkDialogVisible(true)}>
          {_l('设置链接')}
        </Button>
        {privateLinkDialogVisible && (
          <PrivateLinkDialog
            visible={privateLinkDialogVisible}
            onCancel={() => {
              setPrivateLinkDialogVisible(false);
            }}
          />
        )}
      </Fragment>
    );
  }

  return (
    <div className="privateCardWrap flexColumn">
      <div className="Font17 bold mBottom25">{_l('登录与注册')}</div>
      {renderHideRegister()}
      <Divider className="mTop20 mBottom20" />
      {renderAllowEditAccountInfo()}
      <Divider className="mTop20 mBottom20" />
      {renderDeclare()}
      <Divider className="mTop20 mBottom20" />
      {renderFooterInfo()}
      <Divider className="mTop20 mBottom20" />
      <BrandHomeImage />
    </div>
  );
};

export default Login;
