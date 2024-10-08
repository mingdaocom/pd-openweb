import React, { useState, useEffect } from 'react';
import { Popup } from 'antd-mobile';
import { Icon } from 'ming-ui';
import { canEditApp, canEditData } from 'src/pages/worksheet/redux/actions/util.js';
import appManagementApi from 'src/api/appManagement';
import styled from 'styled-components';
import cx from 'classnames';

const ModalWrap = styled(Popup)`
  &.appMoreActionWrap {
    .header {
      padding: 20px 15px 0;
      .closeIcon {
        width: 24px;
        height: 24px;
        text-align: center;
        border-radius: 50%;
        background-color: #e6e6e6;
        .icon {
          line-height: 24px;
        }
      }
    }
    .actionContent {
      padding-left: 20px;
      color: #000;
      line-height: 50px;
      text-align: left;
      font-weight: 600;
      padding-bottom: 15px;
    }
    .active {
      color: #ffd800 !important;
    }
    .lightColor {
      color: #ffa700 !important;
    }
  }
`;

export default function MoreAction(props) {
  const {
    visible,
    viewHideNavi,
    detail = {},
    onClose = () => {},
    dealMarked = () => {},
    navigateTo = () => {},
    dealViewHideNavi = () => {},
  } = props;
  const [roleEntryVisible, setRoleEntryVisible] = useState(true);

  useEffect(() => {
    if (visible) {
      if (!canEditData(detail.permissionType) && !canEditApp(detail.permissionType, detail.isLock)) {
        appManagementApi
          .getAppRoleSetting({
            appId: detail.id,
          })
          .then(data => {
            const { appSettingsEnum } = data;
            setRoleEntryVisible(appSettingsEnum === 1);
          });
      }
    }
  }, [visible]);

  return (
    <ModalWrap visible={visible} className="mobileModal topRadius appMoreActionWrap" onClose={onClose} onMaskClick={onClose}>
      <div className="flexRow header">
        <div className="Font13 Gray_9e flex">{_l('应用操作')}</div>
        <div className="closeIcon" onClick={onClose}>
          <Icon icon="close" className="Font17 Gray_9e bold" />
        </div>
      </div>
      <div className="actionContent">
        {!window.isPublicApp && (
          <div onClick={() => dealMarked(!detail.isMarked ? true : false)}>
            <Icon icon="star_3" className={cx('Gray_9e mRight24 Font20 TxtMiddle', { active: detail.isMarked })} />
            <span className="Font15">{detail.isMarked ? _l('取消收藏') : _l('收藏应用')}</span>
          </div>
        )}
        {roleEntryVisible && (
          <div
            onClick={() => {
              window.mobileNavigateTo(`/mobile/members/${detail.id}`);
              onClose();
            }}
          >
            <Icon icon="group" className="Gray_9e mRight24 Font20 TxtMiddle" />
            <span className="Font15">{_l('人员管理')}</span>
          </div>
        )}
        {(canEditApp(detail.permissionType, detail.isLock) || canEditData(detail.permissionType)) && (
          <div
            onClick={() => {
              dealViewHideNavi(viewHideNavi ? false : true);
              onClose();
            }}
          >
            <Icon
              icon={viewHideNavi ? 'public-folder-hidden' : 'visibility'}
              className={'Gray_9e mRight24 Font20 TxtMiddle'}
            />
            <span className="Font15">{viewHideNavi ? _l('不显示隐藏的应用项') : _l('显示隐藏的应用项')}</span>
          </div>
        )}
      </div>
    </ModalWrap>
  );
}
