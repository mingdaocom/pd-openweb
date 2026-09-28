import React, { Fragment } from 'react';
import { SvgIcon, UserHead } from 'ming-ui';
import { isUsageResetSupported } from '../utils';
import LimitValue from './LimitValue';

/** 根据列 dataIndex 展示应用、工作表、用户、额度或行操作。 */
export default function QuotaCell({
  col,
  data,
  projectId,
  businessType,
  clickSubmit,
  limitRowTotal,
  onChangeItemSize,
  onBlur,
  onReset,
  onRemove,
}) {
  const { app = {}, user = {}, size, entityId, appItem, createTime, _isDraft } = data;
  const limitSize =
    businessType === 1
      ? md.global.SysSettings.fileUploadLimitSize || 4 * 1024
      : businessType === 2
        ? window.platformENV.isLocal || window.platformENV.isOverseas
          ? limitRowTotal * 10
          : 1000
        : 0;

  switch (col.dataIndex) {
    case 'app':
      return (
        <div className="flexRow alignItemsCenter">
          {app.appName ? (
            <Fragment>
              <div className="appIcon" style={{ background: app.appIconColor }}>
                <SvgIcon url={app.appIconUrl} fill="#fff" size={18} className="mTop3" />
              </div>
              <span className="flex ellipsis mRight10" title={app.appName}>
                {app.appName}
              </span>
            </Fragment>
          ) : (
            <span className="Red">{_l('应用已删除')}</span>
          )}
        </div>
      );
    case 'worksheet':
      return (
        <div className="flexRow alignItemsCenter">
          <div className="appIcon">
            <SvgIcon url={appItem.iconUrl} fill="var(--color-text-tertiary)" size={18} className="mTop3" />
          </div>
          <span className="flex ellipsis mRight10" title={appItem.name}>
            {appItem.name}
          </span>
        </div>
      );
    case 'createTime':
      return createTime;
    case 'user':
      return (
        <Fragment>
          <UserHead projectId={projectId} user={{ userHead: user.avatar, accountId: user.accountId }} size={24} />
          <span className="mLeft10 ellipsis">{user.fullname}</span>
        </Fragment>
      );
    case 'size':
      return (
        <LimitValue
          businessType={businessType}
          clickSubmit={clickSubmit}
          limitSize={limitSize}
          size={size}
          unit={col.unit}
          onChange={value => onChangeItemSize(value, data)}
          onBlur={onBlur}
        />
      );
    case 'action':
      return (
        <Fragment>
          {isUsageResetSupported(businessType) && app.appName && createTime && !_isDraft && (
            <div className="textDisabled Hand hoverColorPrimary" onClick={() => onReset([data])}>
              {_l('重置')}
            </div>
          )}
          <div className="textDisabled Hand hoverColorPrimary" onClick={() => onRemove(entityId)}>
            {_l('移除')}
          </div>
          {_isDraft && <div className="draftTag">{_l('未保存')}</div>}
        </Fragment>
      );
    default:
      return null;
  }
}
