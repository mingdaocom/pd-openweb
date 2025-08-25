import React, { Fragment } from 'react';
import styled from 'styled-components';
import { Button, Switch } from 'ming-ui';
import { APP_ROLE_TYPE } from 'src/pages/worksheet/constants/enum';
import { navigateTo } from 'src/router/navigateTo';
import AppSettingHeader from '../AppSettingHeader';
import { closeLockFunc, lockAppFunc, modifyAppLockPassword, unlockAppLockPassword } from './AppLockPasswordDialog';

const Wrap = styled.div`
  .prompt {
    width: 783px;
    height: 33px;
    line-height: 33px;
    background: #fbefe0;
    border-radius: 4px 4px 4px 4px;
    padding-left: 14px;
    margin-bottom: 16px;
  }
  .recoverAction {
    width: 783px;
    justify-content: space-between;
    align-items: center;
  }
`;

export default function LockAppCom(props) {
  const { appId, data = {} } = props;
  const { sourceType, isPassword, isLock, permissionType } = data;
  const isRecovery = !isLock && isPassword;
  const isNormalApp = sourceType === 1;
  const isOwner = permissionType === APP_ROLE_TYPE.POSSESS_ROLE; // 拥有者
  const refreshPage = () => navigateTo(`/app/${appId}`);

  const recoveryLock = () => {
    return (
      <Fragment>
        <div className="prompt">{_l('当前应用为解锁状态')}</div>
        <div className="flexRow recoverAction">
          <div>
            <Button
              onClick={() => {
                unlockAppLockPassword({
                  appId,
                  sourceType,
                  isPassword,
                  isOwner,
                  isLock,
                  refreshPage,
                });
                return;
              }}
            >
              {_l('恢复锁定')}
            </Button>
            {isOwner && (
              <span
                className="ThemeColor Hand mLeft20"
                onClick={() =>
                  modifyAppLockPassword({
                    appId,
                    refreshPage,
                  })
                }
              >
                {_l('修改应用锁密码')}
              </span>
            )}
          </div>
        </div>
      </Fragment>
    );
  };

  return (
    <Wrap>
      <AppSettingHeader
        title={_l('锁定')}
        description={_l(
          '应用锁定状态下所有用户（包括管理员）不能查看、修改应用的配置，用户验证密码后可解锁其在应用下的操作权限。锁定应用需验证身份',
        )}
      />
      <div className="mBottom20">
        <Switch
          disabled={isRecovery && !(isNormalApp && isOwner)}
          checked={isRecovery}
          onClick={checked => {
            if (!checked) {
              lockAppFunc({
                appId,
                refreshPage,
              });
            } else {
              closeLockFunc({ appId, refreshPage });
            }
          }}
        />
        {isRecovery && <span className="Gray_9e mLeft15 TxtMiddle">{_l('开启')}</span>}
      </div>
      {isRecovery && recoveryLock()}
    </Wrap>
  );
}
