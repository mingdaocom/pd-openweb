import React, { Component, Fragment, useState, useEffect } from 'react';
import SvgIcon from 'src/components/SvgIcon';
import { Icon, MdLink, Tooltip } from 'ming-ui';
import cx from 'classnames';
import { convertColor } from '../WorkSheetLeft/WorkSheetItem';
import MoreOperation from '../WorkSheetLeft/MoreOperation';
import Drag from '../WorkSheetLeft/Drag';

const AppItem = (props) => {
  const { appItem, appPkg, appId, groupId, isCharge } = props;
  const { iconColor } = appPkg;
  const { workSheetId, iconUrl, status, parentStatus } = appItem;

  const getNavigateUrl = () => {
    const storage = JSON.parse(localStorage.getItem(`mdAppCache_${md.global.Account.accountId}_${appId}`)) || {};
    const viewId =
      (_.find(storage.worksheets || [], item => item.groupId === groupId && item.worksheetId === workSheetId) || {})
        .viewId || '';
    let url = `/app/${appId}/${groupId}/${workSheetId}${viewId ? `/${viewId}` : ''}`;
    return url;
  }

  return (
    <Drag appItem={appItem} appPkg={appPkg} isCharge={isCharge}>
      <div className={cx('appItemWrap pointer', `workSheetItem-${workSheetId}`)}>
        <MdLink className="flexColumn h100" to={getNavigateUrl()}>
          <Fragment>
            <div className="flex flexRow alignItemsCenter justifyContentCenter" style={{ backgroundColor: convertColor(iconColor) }}>
              <SvgIcon url={iconUrl} fill={iconColor} size={44} />
            </div>
            <div className="nameWrap flexRow alignItemsCenter justifyContentCenter">
              <span className="Gray">
                {appItem.workSheetName}
              </span>
            </div>
          </Fragment>
        </MdLink>
        {isCharge && (
          <MoreOperation {...props}>
            <div className="moreIcon">
              <Icon icon="more_horiz" className="Font18 Gray_9e" />
            </div>
          </MoreOperation>
        )}
        {(status === 2 || parentStatus === 2) && (
          <Tooltip popupPlacement="bottom" text={<span>{_l('仅管理员可见')}</span>}>
            <Icon className="Font16 mRight10 visibilityIcon" icon="visibility_off" style={{ color: '#ee6f09' }} />
          </Tooltip>
        )}
      </div>
    </Drag>
  );
}

export default AppItem;
