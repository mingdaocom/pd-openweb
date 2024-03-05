import React, { Fragment, useState, useEffect } from 'react';
import privateDeclareApi from 'src/api/privateDeclare';
import DeclareDialog from './components/DeclareDialog';
import { Switch } from 'ming-ui';
import { Button, Divider } from 'antd';
import { updateSysSettings } from '../common';

const Login = props => {
  const { IsPlatformLocal } = md.global.Config;
  const { SysSettings } = md.global;
  const [enableDeclareConfirm, setEnableDeclareConfirm] = useState(SysSettings.enableDeclareConfirm);
  const [enableDeclareDialogVisible, setEnableDeclareDialogVisible] = useState(false);
  const [declareData, setDeclareData] = useState({});

  const [hideRegister, setHideRegister] = useState(SysSettings.hideRegister);

  useEffect(() => {
    privateDeclareApi.getDeclare().then(data => {
      data && setDeclareData(data);
    });
  }, []);

  const renderDeclare = () => {
    return (
      <div className="flexRow">
        <div className="flex flexColumn">
          <div className="Font14 bold mBottom7">{_l('协议 / 隐私')}</div>
          <div className="Gray_9e mBottom15">{_l('用户通过 Web 移动端单点登录时，必须同意《服务协议》和《隐私政策》后才可登录平台')}</div>
          <div>
            <Button
              ghost
              type="primary"
              onClick={() => setEnableDeclareDialogVisible(true)}
            >
              {_l('设置')}
            </Button>
          </div>
        </div>
        <Switch
          checked={enableDeclareConfirm}
          onClick={value => {
            value = !value;
            updateSysSettings({
              enableDeclareConfirm: value
            }, () => {
              setEnableDeclareConfirm(value);
              md.global.SysSettings.enableDeclareConfirm = value;
            });
          }}
        />
        <DeclareDialog
          visible={enableDeclareDialogVisible}
          declareData={declareData}
          onChangeDeclareData={(data) => {
            setDeclareData({
              ...declareData,
              ...data
            });
          }}
          onCancel={() => {
            setEnableDeclareDialogVisible(false);
          }}
        />
      </div>
    );
  }

  const renderHideRegister = () => {
    return (
      <div className="flexRow">
        <div className="flex flexColumn">
          <div className="Font14 bold mBottom7">{_l('注册入口')}</div>
          <div className="Gray_9e">{_l('显示登录界面注册入口')}</div>
        </div>
        <Switch
          checked={!hideRegister}
          onClick={value => {
            updateSysSettings({
              hideRegister: value
            }, () => {
              setHideRegister(value);
              md.global.SysSettings.hideRegister = value;
            });
          }}
        />
      </div>
    );
  }

  return (
    <div className="privateCardWrap flexColumn">
      <div className="Font17 bold mBottom25">{_l('登录')}</div>
      {renderDeclare()}
      <Divider className="mTop20 mBottom20" />
      {renderHideRegister()}
    </div>
  );
}

export default Login;

