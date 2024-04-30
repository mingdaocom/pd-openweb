import React, { Fragment, useState, useEffect } from 'react';
import privateDeclareApi from 'src/api/privateDeclare';
import { useSetState } from 'react-use';
import DeclareDialog from './components/DeclareDialog';
import { Switch, Checkbox } from 'ming-ui';
import { Button, Divider } from 'antd';
import { updateSysSettings } from '../common';
import _ from 'lodash';

const Login = props => {
  const { IsPlatformLocal } = md.global.Config;
  const { SysSettings } = md.global;
  const [enableDeclareDialogVisible, setEnableDeclareDialogVisible] = useState(false);
  const [declareData, setDeclareData] = useState({});

  const [
    { hideRegister, enableMobilePhoneRegister, enableEmailRegister, enableEditAccountInfo, enableDeclareConfirm },
    setData,
  ] = useSetState({
    hideRegister: SysSettings.hideRegister,
    enableMobilePhoneRegister: SysSettings.enableMobilePhoneRegister,
    enableEmailRegister: SysSettings.enableEmailRegister,
    enableEditAccountInfo: SysSettings.enableEditAccountInfo,
    enableDeclareConfirm: SysSettings.enableDeclareConfirm,
  });

  useEffect(() => {
    privateDeclareApi.getDeclare().then(data => {
      data && setDeclareData(data);
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
            checked={enableDeclareConfirm}
            text={_l('单点登录时（Web移动端），也必须先同意')}
            onClick={checked => changeSysSettings('enableDeclareConfirm', checked)}
          />
        </div>
        <Button ghost type="primary" onClick={() => setEnableDeclareDialogVisible(true)}>
          {_l('设置')}
        </Button>

        <DeclareDialog
          visible={enableDeclareDialogVisible}
          declareData={declareData}
          onChangeDeclareData={data => {
            setDeclareData({
              ...declareData,
              ...data,
            });
          }}
          onCancel={() => {
            setEnableDeclareDialogVisible(false);
          }}
        />
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

  return (
    <div className="privateCardWrap flexColumn">
      <div className="Font17 bold mBottom25">{_l('账号与注册')}</div>
      {renderHideRegister()}
      <Divider className="mTop20 mBottom20" />
      {renderAllowEditAccountInfo()}
      <Divider className="mTop20 mBottom20" />
      {renderDeclare()}
    </div>
  );
};

export default Login;
