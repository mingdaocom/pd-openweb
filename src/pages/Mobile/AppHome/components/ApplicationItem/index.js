import React from 'react';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon, SvgIcon } from 'ming-ui';
import AppStatus from 'src/pages/AppHomepage/AppCenter/components/AppStatus';
import { transferExternalLinkUrl } from 'src/pages/AppHomepage/AppCenter/utils';
import { getAppOrItemColor } from 'src/pages/AppHomepage/Dashboard/utils.js';
import { generateRandomPassword } from 'src/utils/common';
import { addBehaviorLog } from 'src/utils/project';

const AppItemWrap = styled.div`
  display: flex;
  align-items: center;
  background-color: #f8f8f8;
  border-radius: 8px;
  width: calc(50% - 5px);
  height: 56px;
  margin-bottom: 10px;
  padding-left: 12px;
  position: relative;
  &.empty {
    background-color: #fff;
  }
  .iconWrap {
    width: ${({ radius }) => radius + 'px'};
    height: ${({ radius }) => radius + 'px'};
    border-radius: 50%;
    color: #fff;
    font-size: 32px;
    text-align: center;
    margin-right: 10px;

    .svgWrap {
      height: inherit;
      & > div {
        display: flex;
        justify-content: center;
        align-items: center;
        height: inherit;
      }
    }
  }
  .appName {
    min-width: 0;
    padding-right: 10px;
    .name {
      font-size: 14px;
      &.app {
        word-break: break-all;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        overflow: hidden;
        line-height: 18px;
      }
    }
  }
  .appStatusWrap {
    right: -8px;
    top: -10px;
    bottom: unset;
    left: unset;
  }
`;

export default function ApplicationItem(props) {
  const { data = {}, direction = 'vertical', myPlatformLang, ...rest } = props;
  const {
    id,
    createType,
    urlTemplate,
    projectId,
    icon,
    iconUrl,
    appStatus,
    fixed,
    isGoodsStatus,
    isNew,
    type,
    itemId,
    itemUrl,
    sectionId,
    onClick,
  } = data || {};
  const isUpgrade = appStatus === 4;
  const name = _.get(_.find(myPlatformLang, { key: id }), 'value') || data.name;
  const itemName = _.get(_.find(myPlatformLang, { key: itemId }), 'value') || data.itemName;

  const { className, index, iconSize, radius = 40 } = rest;

  // 应用/应用项 水平显示
  if (direction === 'horizontal') {
    if (id === 'empty') {
      return (
        <AppItemWrap
          className={cx(`appItem ${className}`, { mRight10: index % 2 === 0 })}
          key={generateRandomPassword(10)}
        />
      );
    }

    return (
      <AppItemWrap
        radius={radius}
        className={cx(`appItem ${className}`, { mRight10: index % 2 === 0 })}
        key={id}
        onClick={e => {
          if (type) {
            //应用项
            addBehaviorLog(type === 2 ? 'worksheet' : 'customPage', itemId); // 埋点
            window.mobileNavigateTo(`/mobile/recordList/${id}/${sectionId}/${itemId}`);
            return;
          }
          addBehaviorLog('app', id); // 埋点
          if (createType === 1) {
            e.stopPropagation();
            e.preventDefault();
            window.open(transferExternalLinkUrl(urlTemplate, projectId, id));
            return;
          }
          localStorage.removeItem('currentNavWorksheetId');
          safeLocalStorageSetItem('currentGroupInfo', JSON.stringify({}));
          window.mobileNavigateTo(`/mobile/app/${id}`);
        }}
      >
        <div
          className="iconWrap"
          style={{ backgroundColor: type ? getAppOrItemColor(data, true).bg : getAppOrItemColor(data).bg }}
        >
          {iconUrl ? (
            <SvgIcon
              className="svgWrap"
              url={type ? itemUrl : iconUrl}
              fill={type ? getAppOrItemColor(data, true).iconColor : getAppOrItemColor(data).iconColor}
              size={iconSize || 30}
            />
          ) : (
            <Icon icon={icon} className="Font30" />
          )}
        </div>
        <div className="appName flex">
          <div className={cx('name', { app: !type, ellipsis: type })}>{type ? itemName : name}</div>
          {type ? <div className="des ellipsis Font12 Gray_9">{name}</div> : null}
        </div>
        {id === 'add' || (!fixed && !isUpgrade && !isNew && isGoodsStatus) ? null : (
          <AppStatus
            className="appStatusWrap"
            isGoodsStatus={isGoodsStatus}
            isNew={isNew}
            fixed={fixed}
            isUpgrade={isUpgrade}
          />
        )}
      </AppItemWrap>
    );
  }

  if (id === 'empty') {
    return <div className="myAppItemWrap InlineBlock" key={generateRandomPassword(10)} />;
  }

  return (
    <div className="myAppItemWrap InlineBlock" key={`${data.id}-${generateRandomPassword(10)}`}>
      <div
        className="myAppItem mTop24"
        onClick={e => {
          if (id !== 'add') {
            addBehaviorLog('app', id); // 埋点
          }
          if (createType === 1) {
            e.stopPropagation();
            e.preventDefault();
            window.open(transferExternalLinkUrl(urlTemplate, projectId, id));
            return;
          }
          localStorage.removeItem('currentNavWorksheetId');
          safeLocalStorageSetItem('currentGroupInfo', JSON.stringify({}));
          onClick ? onClick() : window.mobileNavigateTo(`/mobile/app/${id}`);
        }}
      >
        <div
          className="myAppItemDetail TxtCenter Relative"
          style={{ backgroundColor: type ? getAppOrItemColor(data, true).bg : getAppOrItemColor(data).bg }}
        >
          {iconUrl ? (
            <SvgIcon
              className="svgWrap"
              url={type ? itemUrl : iconUrl}
              fill={type ? getAppOrItemColor(data, true).iconColor : getAppOrItemColor(data).iconColor}
              size={32}
            />
          ) : (
            <Icon icon={icon} className="Font30" />
          )}
          {id === 'add' || (!fixed && !isUpgrade && !isNew && isGoodsStatus) ? null : (
            <AppStatus isGoodsStatus={isGoodsStatus} isNew={isNew} fixed={fixed} isUpgrade={isUpgrade} />
          )}
        </div>
        <span className="breakAll LineHeight16 Font13 mTop10 contentText" style={{ WebkitBoxOrient: 'vertical' }}>
          {name}
        </span>
      </div>
    </div>
  );
}
