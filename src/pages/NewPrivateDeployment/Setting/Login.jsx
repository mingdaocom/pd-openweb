import React, { Fragment, useEffect, useState } from 'react';
import { useSetState } from 'react-use';
import { Button, Divider, Input, Tooltip } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import { Checkbox, Icon, LoadDiv, Radio, Switch } from 'ming-ui';
import privateLinkApi from 'src/api/privateLink';
import SettingIconAndName from 'src/pages/Admin/components/SettingIconAndName';
import { updateSysSettings } from '../common';
import { BrandHomeImage } from '../Platform/Brand';
import PrivateLinkDialog from './components/PrivateLinkDialog';
import SSOSet from './SSOSet';

const Login = props => {
  const { IsPlatformLocal } = md.global.Config;
  const { SysSettings } = md.global;
  const [privateLinkDialogVisible, setPrivateLinkDialogVisible] = useState(false);
  const [linkList, setLinkList] = useState([]);
  const [linkListLoading, setLinkListLoading] = useState(true);

  const [
    {
      hideRegister,
      enableMobilePhoneRegister,
      enableEmailRegister,
      enableEditAccountInfo,
      enableVerificationCodeLogin,
      allowBindAccountNoVerify,
      enableDeclareRegisterConfirm,
      enableDeclareConfirm,
      enableFooterInfo,
      footerThemeColor,
    },
    setData,
  ] = useSetState({
    hideRegister: SysSettings.hideRegister,
    enableMobilePhoneRegister: SysSettings.enableMobilePhoneRegister,
    enableEmailRegister: SysSettings.enableEmailRegister,
    enableVerificationCodeLogin: SysSettings.enableVerificationCodeLogin,
    enableEditAccountInfo: SysSettings.enableEditAccountInfo,
    allowBindAccountNoVerify: SysSettings.allowBindAccountNoVerify,
    enableDeclareRegisterConfirm: SysSettings.enableDeclareRegisterConfirm,
    enableDeclareConfirm: SysSettings.enableDeclareConfirm || false,
    enableFooterInfo: SysSettings.enableFooterInfo,
    footerThemeColor: SysSettings.footerThemeColor,
  });

  useEffect(() => {
    privateLinkApi.getLinkList().then(data => {
      setLinkList(data);
      setLinkListLoading(false);
    });
  }, []);

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

  const renderEnableVerificationCodeLoginInfo = () => {
    return (
      <Fragment>
        <div className="flexRow">
          <div className="flex flexColumn">
            <div className="Font14 bold mBottom7">{_l('允许使用验证码登录')}</div>
            <div className="Gray_9e">
              {_l('开启时,支持使用短信或邮件验证码登录。为确保功能可用,须先集成短信、邮件服务')}
            </div>
          </div>
          <Switch
            checked={enableVerificationCodeLogin}
            onClick={value => changeSysSettings('enableVerificationCodeLogin', value)}
          />
        </div>
      </Fragment>
    );
  };

  const renderAllowBindAccountNoVerify = () => {
    return (
      <div className="flexRow valignWrapper">
        <div className="flex flexColumn">
          <div className="Font14 bold mBottom8">{_l('邮箱和手机号验证')}</div>
          <div className="Gray_9e">{_l('开启后绑定邮箱或手机号时，需要验证合法性')}</div>
        </div>
        <Switch
          checked={!allowBindAccountNoVerify}
          onClick={value => {
            changeSysSettings('allowBindAccountNoVerify', !value);
          }}
        />
      </div>
    );
  };

  const renderFooterInfo = () => {
    return (
      <Fragment>
        <div className="flexRow mBottom15">
          <div className="flex flexColumn">
            <div className="Font14 bold mBottom7">{_l('底部信息栏')}</div>
            <div className="Gray_9e">{_l('在登录、注册页底部显示自定义链接如：法律条款、备案号等信息')}</div>
            <div className="flexRow mTop10">
              <div className="Gray_9e mRight30">{_l('颜色')}</div>
              {[
                { text: _l('浅色'), value: 1 },
                { text: _l('深色'), value: 2 },
              ].map((item, index) => (
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
          <Switch checked={enableFooterInfo} onClick={value => changeSysSettings('enableFooterInfo', value)} />
        </div>
        <div className="mBottom15">
          {linkListLoading ? (
            <LoadDiv size="small" className="mAll0" style={{ width: 100 }} />
          ) : (
            linkList.map(item => (
              <div className="flexRow valignWrapper mBottom10">
                <div className="Gray mRight10">{item.name}</div>
                <Tooltip title={item.href} placement="top">
                  <div className="Gray_9e ellipsis" style={{ maxWidth: 400 }}>
                    {item.href}
                  </div>
                </Tooltip>
                <div className="Gray_9e">
                  <Icon
                    className="hoverText Font12 mLeft5"
                    icon="task-new-detail"
                    onClick={() => {
                      window.open(item.href);
                    }}
                  />
                </div>
              </div>
            ))
          )}
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
            onSave={list => {
              setLinkList(list);
            }}
          />
        )}
      </Fragment>
    );
  };

  return (
    <div className="privateCardWrap flexColumn">
      <div className="Font17 bold mBottom25">{_l('登录与注册')}</div>
      {renderHideRegister()}
      <Divider className="mTop20 mBottom20" />
      {renderEnableVerificationCodeLoginInfo()}
      <Divider className="mTop20 mBottom20" />
      {renderAllowEditAccountInfo()}
      <Divider className="mTop20 mBottom20" />
      {!IsPlatformLocal && (
        <Fragment>
          {renderAllowBindAccountNoVerify()}
          <Divider className="mTop20 mBottom20" />
        </Fragment>
      )}
      {renderDeclare()}
      <Divider className="mTop20 mBottom20" />
      {renderFooterInfo()}
      <Divider className="mTop20 mBottom20" />
      <BrandHomeImage />
    </div>
  );
};

const Sso = prosp => {
  const { SysSettings } = md.global;
  const [edit, setEdit] = useState(false);
  const [ssoWebUrl, setSsoWebUrl] = useState(SysSettings.ssoWebUrl);
  const [ssoAppUrl, setSsoAppUrl] = useState(SysSettings.ssoAppUrl);
  const [ssoName, setSsoName] = useState(SysSettings.ssoName);
  const [enableSso, setEnableSso] = useState(SysSettings.enableSso || false);
  const [ssoIconUrl, setSsoIconUrl] = useState(SysSettings.ssoIconUrl);
  const handleSave = () => {
    updateSysSettings(
      {
        ssoWebUrl,
        ssoAppUrl,
        ssoName,
      },
      () => {
        md.global.SysSettings.ssoWebUrl = ssoWebUrl;
        md.global.SysSettings.ssoAppUrl = ssoAppUrl;
        md.global.SysSettings.ssoName = ssoName;
        setEdit(false);
      },
    );
  };
  const handleReset = () => {
    setSsoWebUrl(SysSettings.ssoWebUrl);
    setSsoAppUrl(SysSettings.ssoAppUrl);
    setEdit(false);
  };
  return (
    <div className="privateCardWrap flexColumn">
      <div className="flexRow">
        <div className="flex Font17 bold mBottom5">{_l('SSO自主集成')}</div>
        <Switch
          checked={enableSso}
          onClick={value => {
            updateSysSettings(
              {
                enableSso: !value,
              },
              () => {
                setEnableSso(!value);
                md.global.SysSettings.enableSso = !value;
              },
            );
          }}
        />
      </div>
      <div className="mBottom15 Gray_9e">
        {_l('开启后，Web 端可使用SSO登录。当用户通过SSO完成登录后，在退出登录时将会被重定向回SSO登录页')}
      </div>
      <SettingIconAndName
        className="mBottom10"
        iconClassName="icon-tab_move"
        defaultName="SSO"
        uploadType={4}
        name={ssoName}
        iconUrl={ssoIconUrl}
        handleSave={({ name, iconUrl, file, success = () => {} }) => {
          const ssoIcon = file && !_.isEmpty(file) ? file.fileName : '';
          updateSysSettings({ ssoName: name, ssoIcon }, () => {
            success(iconUrl);
            setSsoName(name);
            setSsoIconUrl(iconUrl);
            md.global.SysSettings.ssoName = name;
            md.global.SysSettings.ssoIconUrl = iconUrl;
            md.global.SysSettings.ssoIcon = ssoIcon;
          });
        }}
      />
      {edit ? (
        <Fragment>
          <div className="flexColumn mBottom20">
            <div className="mBottom5">{'PC'}</div>
            <Input
              className="flex"
              value={ssoWebUrl}
              onChange={event => {
                setSsoWebUrl(event.target.value.replace(/\s/g, ''));
              }}
            />
          </div>
          <div className="flexColumn mBottom20">
            <div className="mBottom5">{'H5'}</div>
            <Input
              className="flex"
              value={ssoAppUrl}
              onChange={event => {
                setSsoAppUrl(event.target.value.replace(/\s/g, ''));
              }}
            />
          </div>
          <div className="flexRow valignWrapper">
            <Button className="mRight10" type="primary" onClick={handleSave}>
              {_l('保存')}
            </Button>
            <Button onClick={handleReset}>{_l('取消')}</Button>
          </div>
        </Fragment>
      ) : (
        <Fragment>
          {ssoWebUrl && (
            <div className="flexRow mBottom20">
              <div className="mRight25 Gray_9e">{'PC'}</div>
              <div>{ssoWebUrl}</div>
            </div>
          )}
          {ssoAppUrl && (
            <div className="flexRow mBottom20">
              <div className="mRight25 Gray_9e">{'H5'}</div>
              <div>{ssoAppUrl}</div>
            </div>
          )}
          <Button ghost type="primary" style={{ width: 'max-content' }} onClick={() => setEdit(true)}>
            {_l('设置')}
          </Button>
        </Fragment>
      )}
    </div>
  );
};

const LoginGotoAppId = props => {
  const { SysSettings } = md.global;
  const [isEdit, setIsEdit] = useState(false);
  const [{ loginGotoAppId, loginGotoUrl, type }, setState] = useSetState({
    loginGotoUrl: SysSettings.loginGotoUrl || '',
    loginGotoAppId: SysSettings.loginGotoAppId || '',
    type: SysSettings.loginGotoAppId ? 2 : 1,
  });

  const handleSave = () => {
    let param = { loginGotoUrl, loginGotoAppId: '' };
    let key1 = 'loginGotoUrl';
    let key2 = 'loginGotoAppId';
    if (type === 2) {
      key1 = 'loginGotoAppId';
      key2 = 'loginGotoUrl';
      if (loginGotoAppId && loginGotoAppId.length !== 36) {
        alert(_l('应用ID格式不正确，请重新输入'), 3);
        return;
      }
      param = { loginGotoAppId, loginGotoUrl: '' };
    }
    updateSysSettings(param, () => {
      setState({
        [key1]: param[key1],
        [key2]: '',
        type: param.loginGotoAppId ? 2 : 1,
      });
      md.global.SysSettings[key1] = param[key1];
      md.global.SysSettings[key2] = '';
      setIsEdit(false);
    });
  };
  const handleReset = () => {
    setState({
      loginGotoUrl: SysSettings.loginGotoUrl || '',
      loginGotoAppId: SysSettings.loginGotoAppId || '',
      type: SysSettings.loginGotoAppId ? 2 : 1,
    });
    setIsEdit(false);
  };

  return (
    <div className="privateCardWrap flexRow">
      <div className="flex flexColumn">
        <div className="Font14 bold mBottom7">{_l('登录后直接进入指定页面')}</div>
        <div className="Gray_9e mBottom15">
          {_l(
            '设置登录后直接进入指定的应用或系统内页面。可填写应用ID(见应用管理右上角)或系统内页面的地址,未填写时不生效',
          )}
        </div>
        {isEdit ? (
          <Fragment>
            <div className="mBottom15 flexColumn">
              <div className="flexRow mTop10 flex">
                {[
                  { text: _l('链接地址'), value: 1 },
                  { text: _l('应用'), value: 2 },
                ].map((item, index) => (
                  <div className="mRight30">
                    <Radio
                      key={`type_${index}`}
                      text={item.text}
                      checked={type === item.value}
                      onClick={() => {
                        if (item.value === type) return;
                        setState({ type: item.value });
                      }}
                    />
                  </div>
                ))}
              </div>
              <span className="Gray_9e mTop20">{type === 1 ? _l('设置链接地址') : _l('设置应用ID')}</span>
              <div className="flexRow valignWrapper mTop10">
                {type === 1 && <span className="Gray">{md.global.Config.WebUrl}</span>}
                <Input
                  className={cx('flex', { mLeft10: type === 1 })}
                  style={{ width: 500 }}
                  value={type === 1 ? loginGotoUrl : loginGotoAppId}
                  onChange={event => {
                    if (type === 1) {
                      setState({ loginGotoUrl: event.target.value.replace(/\s/g, '') });
                    } else {
                      setState({ loginGotoAppId: event.target.value.replace(/\s/g, '') });
                    }
                  }}
                />
              </div>
            </div>
            <div className="flexRow valignWrapper">
              <Button className="mRight10" type="primary" onClick={handleSave}>
                {_l('保存')}
              </Button>
              <Button onClick={handleReset}>{_l('取消')}</Button>
            </div>
          </Fragment>
        ) : (
          <Fragment>
            <div className="mBottom15 valignWrapper">
              <span className="Gray_9e mRight18">{loginGotoAppId ? _l('应用ID') : _l('进入链接地址')}</span>
              <span>
                {loginGotoAppId
                  ? loginGotoAppId
                  : loginGotoUrl
                    ? `${md.global.Config.WebUrl}${loginGotoUrl}`
                    : _l('未设置')}
              </span>
            </div>
            <div>
              <Button ghost type="primary" onClick={() => setIsEdit(true)}>
                {_l('设置')}
              </Button>
            </div>
          </Fragment>
        )}
      </div>
    </div>
  );
};

export default props => {
  return (
    <Fragment>
      <Login {...props} />
      <SSOSet {...props} />
      <Sso {...props} />
      <LoginGotoAppId {...props} />
    </Fragment>
  );
};
