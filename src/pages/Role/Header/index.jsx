import React, { Fragment, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import Trigger from 'rc-trigger';
import { navigateTo } from 'router/navigateTo';
import { Icon, Support, SvgIcon } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import AppManagementAjax from 'src/api/appManagement';
import externalPortalAjax from 'src/api/externalPortal';
import { checkCertification } from 'src/components/checkCertification';
import { buriedUpgradeVersionDialog } from 'src/components/upgradeVersion';
import { canEditApp, canEditData } from 'src/pages/worksheet/redux/actions/util';
import { VersionProductType } from 'src/utils/enum';
import { getFeatureStatus } from 'src/utils/project';
import { EDIT_TYPE_CONFIG, sysRoleType } from '../config';
import openImg from '../img/open.gif';
import { DividerVertical, IconWrap, RoleDebugSwitch, TopBar, WrapOpenPortalBtn, WrapPop, WrapTabCon } from './style';

export default function RoleHeader(props) {
  const { appDetail = {}, editType, isOpenPortal, roleDebug, handleChangePage, onChangeStates } = props;
  const { projectId = '' } = appDetail;
  const {
    match: {
      params: { appId },
    },
  } = props;
  const editApp = canEditApp(appDetail.permissionType, appDetail.isLock);
  const editUser = canEditData(appDetail.permissionType);
  const canEnterPortal = editApp || editUser;
  const { iconColor, name, iconUrl } = appDetail;
  const featureType = canEnterPortal ? getFeatureStatus(projectId, VersionProductType.externalPortal) : false;

  const [externalPortalEnableVisible, setExternalPortalEnableVisible] = useState(false);
  const [openLoading, setOpenLoading] = useState(false);

  // 开启外部门户
  const openPortal = () => {
    if (featureType === '2') {
      buriedUpgradeVersionDialog(projectId, 11);
      return;
    }
    if (openLoading) return;

    setOpenLoading(true);
    externalPortalAjax.editExPortalEnable({ appId, isEnable: true }).then(res => {
      setOpenLoading(false);
      setExternalPortalEnableVisible(false);
      if (res) {
        onChangeStates({ isOpenPortal: true, editType: 1 }, () => {
          navigateTo(`/app/${appId}/role/external`);
        });
      } else {
        alert(_l('开启失败'), 2);
      }
    });
  };

  const backToApp = () => {
    window.disabledSideButton = true;

    const storage = JSON.parse(localStorage.getItem(`mdAppCache_${md.global.Account.accountId}_${appId}`)) || {};

    if (storage) {
      const { lastGroupId, lastWorksheetId, lastViewId } = storage;
      navigateTo(
        `/app/${appId}/${[lastGroupId, lastWorksheetId, lastViewId]
          .filter(o => o && !_.includes(['undefined', 'null'], o))
          .join('/')}?from=insite`,
      );
    } else {
      navigateTo(`/app/${appId}`);
    }
  };

  return (
    <TopBar className={cx('', { mBottom0: editType === 1 })}>
      <div className="flexRow pointer Gray_bd mLeft16" onClick={() => backToApp()}>
        <Tooltip placement="bottomLeft" title={_l('应用：%0', name)}>
          <div className="flexRow alignItemsCenter">
            <i className="icon-navigate_before Font20" />
            <IconWrap style={{ backgroundColor: iconColor }}>
              <SvgIcon url={iconUrl} fill="#fff" size={18} />
            </IconWrap>
          </div>
        </Tooltip>
      </div>
      <div
        className={cx('nativeTitle Font17 bold mLeft16 overflow_ellipsis', {
          flex: !canEnterPortal || (canEnterPortal && !isOpenPortal && featureType),
        })}
        style={{
          maxWidth: !canEnterPortal || (canEnterPortal && !isOpenPortal && featureType) ? '100%' : 200,
        }}
      >
        {_l('用户')}
      </div>
      {canEnterPortal && isOpenPortal && (
        <WrapTabCon className="editTypeTab">
          {[0, 1]
            .filter(o => (canEnterPortal ? true : o !== 1))
            .map(o => {
              if (o === 1 && !featureType) return;
              return (
                <span
                  className={cx('editTypeTabLi Hand Bold Font14', { current: editType === o })}
                  onClick={() => {
                    if (o === editType) return;
                    handleChangePage(() => {
                      if (o === 1) {
                        if (featureType === '2') {
                          buriedUpgradeVersionDialog(projectId, VersionProductType.externalPortal);
                          return;
                        }
                        navigateTo(`/app/${appId}/role/external`);
                        //获取外部门户的角色信息
                      } else {
                        navigateTo(`/app/${appId}/role`);
                      }
                      onChangeStates({ editType: o });
                    });
                  }}
                >
                  {EDIT_TYPE_CONFIG[o]}
                </span>
              );
            })}
        </WrapTabCon>
      )}
      {editApp && !isOpenPortal && featureType && (
        <Trigger
          action={['click']}
          popupVisible={externalPortalEnableVisible}
          onPopupVisibleChange={visible =>
            visible
              ? checkCertification({
                  projectId,
                  checkSuccess: () => setExternalPortalEnableVisible(visible),
                })
              : setExternalPortalEnableVisible(visible)
          }
          popup={
            <WrapPop className="openPortalWrap">
              <img src={openImg} className="Block" />
              <div className="con">
                <h6>{_l('将应用发布给组织外用户使用')}</h6>
                <ul>
                  <li>{_l('用于提供会员服务，如：作为资料库、内容集、讨论组等。')}</li>
                  <li>{_l('用于和你的业务客户建立关系，如：服务外部客户的下单，查单等场景。')}</li>
                  <li>{_l('支持微信、手机/邮箱验证码及密码登录')}</li>
                </ul>
                <div className={cx('btn InlineBlock', { disable: openLoading })} onClick={() => openPortal()}>
                  {openLoading ? _l('开启中...') : _l('启用外部门户')}
                </div>
                <Support
                  href="https://help.mingdao.com/portal/introduction"
                  type={3}
                  className="helpPortal"
                  text={_l('了解更多')}
                />
              </div>
            </WrapPop>
          }
          popupAlign={{
            points: ['tr', 'tr'],
            offset: [17, 0],
          }}
        >
          <WrapOpenPortalBtn className={cx('openPortalBtn Hand InlineBlock', { disable: openLoading })}>
            <Icon className="Font20 Hand mLeft10 mRight6 set " icon="external_users_01" />
            {openLoading ? _l('开启中...') : _l('启用外部门户')}
          </WrapOpenPortalBtn>
        </Trigger>
      )}
      {sysRoleType.concat(200).includes(appDetail.permissionType) &&
        editType !== 1 &&
        appDetail.permissionType !== 1 && (
          <Fragment>
            {editApp && !isOpenPortal && featureType && <DividerVertical className="mLeft24" />}
            <Tooltip
              placement="bottomLeft"
              title={
                <span>
                  {_l('开启后，应用管理员、运营者可以使用不同的角色身份访问应用。开发者暂不支持使用此功能。')}
                </span>
              }
            >
              <div
                className={cx('mLeft24 valignWrapper', {
                  isAbsolute: !(editApp && !isOpenPortal && featureType),
                })}
              >
                <RoleDebugSwitch
                  checked={roleDebug}
                  size="small"
                  onClick={checked => {
                    AppManagementAjax.updateAppDebugModel({
                      appId,
                      isDebug: !checked,
                    }).then(res => {
                      res && onChangeStates({ roleDebug: !checked });
                    });
                  }}
                />
                <span className="mLeft8">{_l('角色调试')}</span>
              </div>
            </Tooltip>
          </Fragment>
        )}
    </TopBar>
  );
}
