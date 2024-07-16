import React, { useEffect, useState } from 'react';
import { MdLink, VCenterIconText, Icon, Tooltip } from 'ming-ui';
import { canEditApp, canEditData } from 'src/pages/worksheet/redux/actions/util.js';
import appManagementApi from 'src/api/appManagement';
import styled from 'styled-components';
import cx from 'classnames';
import { TinyColor } from '@ctrl/tinycolor';
import localForage from 'localforage';

const RoleDebugSelectWrap = styled.div(
  ({ navColor, borderColor }) => `
    width: 160px;
    height: 32px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    cursor: pointer;
    &:hover {
      border: 1px solid ${borderColor} !important;
    }
    a {
      line-height: 1;
    }
    .roledebugSelectWrap-iconWrap {
      padding: 0 9px;
      border-radius: 34px;
      background: ${navColor};
      display: flex;
      height: 24px;
      align-items: center;
      position: relative;
      &::after {
        content: '';
        width: 100%;
        height: 100%;
        position: absolute;
        top: 0;
        left: 0;
        border-radius: 34px;
      }
    }
`,
);

export default ({
  appId,
  permissionType,
  isLock,
  navColor,
  iconColor,
  showRoleDebug,
  debugRole = { canDebug: false },
  roleSelectValue = [],
  otherAllShow = true,
}) => {
  const [roleEntryVisible, setRoleEntryVisible] = useState(true);
  const [loading, setLoading] = useState(false);
  const canDebug = (debugRole || {}).canDebug || false;

  useEffect(() => {
    if (!canEditData(permissionType) && !canEditApp(permissionType, isLock)) {
      setLoading(true);
      appManagementApi
        .getAppRoleSetting({
          appId,
          NotOnSettingPage: true,
        })
        .then(data => {
          const { appSettingsEnum } = data;
          setRoleEntryVisible(appSettingsEnum === 1);
          setLoading(false);
        });
    }
  }, []);

  const getBorderColor = () => {
    if (!iconColor) return 'rgba(255, 255, 255, 0.3)';
    return new TinyColor(iconColor).setAlpha(0.3).toRgbString();
  };

  const renderRoleDebugSelect = () => {
    if (!canDebug) {
      return (
        <MdLink to={`/app/${appId}/role`}>
          <div className="flexRow appExtensionItem" data-tip={_l('用户')}>
            <Icon className="Font20" icon="group" />
          </div>
        </MdLink>
      );
    }

    return (
      <RoleDebugSelectWrap className="roledebugSelectWrap mRight12" navColor={navColor} borderColor={getBorderColor()}>
        {roleEntryVisible && (
          <MdLink to={`/app/${appId}/role`}>
            <Tooltip placement="bottom" text={_l('用户')}>
              <div className="mLeft4 roledebugSelectWrap-iconWrap mRight10">
                <Icon icon="group" className="Font20" />
              </div>
            </Tooltip>
          </MdLink>
        )}
        <div
          className={cx('flex valignWrapper overflowHidden', { pLeft15: !roleEntryVisible })}
          onClick={() => showRoleDebug()}
        >
          <span className="overflow_ellipsis bold flex text valignWrapper">
            {roleSelectValue.length === 0
              ? _l('选择角色')
              : roleSelectValue.length === 1
              ? roleSelectValue[0].name
              : _l('%0个角色', roleSelectValue.length)}
          </span>
          <Tooltip disable={!roleSelectValue.length} placement="bottom" text={_l('清空调试')}>
            <Icon
              icon={!!roleSelectValue.length ? 'cancel' : 'expand_more'}
              className="Font16 mRight12 iconHover"
              onClick={e => {
                !!roleSelectValue.length && e.stopPropagation();
                if (!roleSelectValue.length) return;

                localForage.clear();
                appManagementApi
                  .setDebugRoles({
                    appId,
                    roleIds: [],
                  })
                  .then(res => {
                    res && window.location.reload();
                  });
              }}
            />
          </Tooltip>
        </div>
      </RoleDebugSelectWrap>
    );
  };

  if (loading) return null;

  return (
    <div className="appExtensionWrap">
      {otherAllShow && !window.isPublicApp && canEditApp(permissionType, isLock) && (
        <MdLink to={`/app/${appId}/workflow`}>
          <div className="flexRow appExtensionItem" data-tip={_l('工作流')}>
            <Icon className="Font20" icon="workflow" />
          </div>
        </MdLink>
      )}
      {(roleEntryVisible || canDebug) && renderRoleDebugSelect()}
    </div>
  );
};
