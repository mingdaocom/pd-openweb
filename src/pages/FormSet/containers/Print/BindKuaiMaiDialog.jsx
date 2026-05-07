import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { Dialog, FunctionWrap, Input } from 'ming-ui';
import systemIntegrationAjax from 'src/api/systemIntegration';
import { encrypt } from 'src/utils/common';

const Con = styled.div`
  .formItemLabel {
    width: 90px;
    position: relative;
    padding-left: 10px;
    color: var(--color-text-secondary);
  }
  .required {
    color: var(--color-error);
    position: absolute;
    left: 0px;
    top: 3px;
  }
`;

export function BindKuaiMaiDialog(props) {
  const { id, projectId, onCancel, onOk } = props;
  const [appId, setAppId] = useState('');
  const [appSecret, setAppSecret] = useState('');
  const appIdInputRef = useRef(null);
  const appSecretInputRef = useRef(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [isEditSecret, setIsEditSecret] = useState(false);
  const [systemIntegration, setSystemIntegration] = useState({});

  const getSystemIntegration = () => {
    systemIntegrationAjax.getSystemIntegration({ projectId, id }).then(res => {
      if (res) {
        setAppId(res.configSetting.cloudAppId);
        setAppSecret(res.configSetting.cloudSecretKey);
        setSystemIntegration(res);
      }
    });
  };

  const handleOk = () => {
    if (!appId.trim()) {
      alert(_l('请输入appID'), 2);
      appIdInputRef && appIdInputRef.current && appIdInputRef.current.focus();
      return;
    }

    if (!appSecret.trim()) {
      appSecretInputRef && appSecretInputRef.current && appSecretInputRef.current.focus();
      alert(_l('请输入appSecret'), 2);
      return;
    }

    setSaveLoading(true);

    const params = {
      projectId,
      type: 1, // 1: 云打印
      id,
      configSetting: {
        type: 0, // 0: 快麦云打印
        cloudAppId: encrypt(appId),
        cloudSecretKey: encrypt(appSecret),
      },
    };

    const promise = !id ? systemIntegrationAjax.addSystemIntegration : systemIntegrationAjax.updateSystemIntegration;

    promise(params)
      .then(res => {
        setSaveLoading(false);
        if (res) {
          alert(_l('保存成功'));
          onCancel();
          onOk(appId, appSecret);
        } else {
          alert(_l('保存失败'), 2);
        }
      })
      .catch(() => {
        setSaveLoading(false);
      });
  };

  useEffect(() => {
    if (id) {
      getSystemIntegration();
    }
  }, [id]);

  return (
    <Dialog
      title={_l('快麦云打印')}
      width={680}
      visible
      okDisabled={
        saveLoading ||
        !appId ||
        !appSecret ||
        (!!id &&
          appId === systemIntegration?.configSetting?.cloudAppId &&
          appSecret === systemIntegration?.configSetting?.cloudSecretKey)
      }
      onCancel={onCancel}
      onOk={handleOk}
    >
      <div className="bindKuaiMaiDialogContent">
        <div className="textSecondary mBottom16 bold">
          <span>{_l('填写')}</span>
          <a className="mLeft5 mRight5" href="https://open.iot.kuaimai.com/#/home" target="_blank">
            {_l('快麦云打印')}
          </a>
          <span>
            {_l(
              '开放平台提供的 appId 与 appSecret，用于完成与第三方云打印服务的安全对接。配置完成后，系统将通过云端接口向快麦云发送打印指令，由快麦云负责将数据转发至已绑定的打印设备，实现小票、标签等场景的远程打印。',
            )}
          </span>
        </div>
        <Con className="formGroup">
          <div className="flexRow mBottom24 alignItemsCenter">
            <div className="formItemLabel">
              <span className="required">*</span>
              {_l('appId')}
            </div>
            <Input
              manualRef={appIdInputRef}
              autoFocus
              className="flex"
              placeholder={_l('appId')}
              value={appId}
              onChange={val => setAppId(val)}
            />
          </div>
          <div className="flexRow alignItemsCenter">
            <div className="formItemLabel">
              <span className="required">*</span>
              {_l('appSecret')}
            </div>
            {!!id && !isEditSecret ? (
              <div className="flexRow alignItemsCenter Height36">
                <span className="minWidth0 Font14 textTertiary overflow_ellipsis">{appSecret || ''}</span>
                <i
                  className="icon icon-edit Hand textTertiary mLeft10 Font15 hoverColorPrimary"
                  onClick={() => {
                    setIsEditSecret(true);
                    setAppSecret('');
                    setTimeout(() => {
                      appSecretInputRef && appSecretInputRef.current && appSecretInputRef.current.focus();
                    }, 0);
                  }}
                />
              </div>
            ) : (
              <Input
                manualRef={appSecretInputRef}
                className="flex"
                placeholder={_l('请输入appSecret')}
                value={appSecret}
                onChange={val => setAppSecret(val)}
              />
            )}
          </div>
        </Con>
      </div>
    </Dialog>
  );
}

export default props => {
  FunctionWrap(BindKuaiMaiDialog, { ...props });
};
