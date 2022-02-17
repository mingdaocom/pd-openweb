import React, { memo } from 'react';
import { string } from 'prop-types';
import { navigateTo } from 'src/router/navigateTo';
import { Icon } from 'ming-ui';
import styled from 'styled-components';
import cx from 'classnames';
import { getAppStatusText } from 'src/pages/PageHeader/util';
import SvgIcon from 'src/components/SvgIcon';

const AppStatus = styled.div`
  border-radius: 10px;
  padding: 0 8px;
  line-height: 22px;
  box-sizing: border-box;
  background: #333;
  color: #fff;
  margin-left: 8px;
  text-align: center;
  white-space: nowrap;
  &.isOverdue {
    background: #bdbdbd;
  }
  &.fixed {
    background: #fd7558;
  }
`;

export default memo(
  ({
    type,
    id,
    iconUrl,
    handleMarkApp,
    closeIndexSide,
    projectId,
    projectName,
    name,
    isMarked,
    iconColor,
    isGoodsStatus,
    isNew,
    fixed
  }) => (
    <li
      key={id}
      onClick={() => {
        closeIndexSide();
        const storage = JSON.parse(localStorage.getItem(`mdAppCache_${md.global.Account.accountId}_${id}`));

        if (storage) {
          const { lastGroupId, lastWorksheetId, lastViewId } = storage;
          navigateTo(`/app/${id}/${_.filter([lastGroupId, lastWorksheetId, lastViewId], item => !!item).join('/')}`);
        } else {
          navigateTo(`/app/${id}`);
        }
      }}>
      <div className="iconWrap" style={{ backgroundColor: iconColor || '#2196f3' }}>
        <SvgIcon url={iconUrl} fill="#fff" size={18} />
      </div>
      <div className="appInfo">
        <div className="flexRow">
          <span className="Font14 overflow_ellipsis">{name}</span>
          {getAppStatusText({ isGoodsStatus, isNew, fixed }) && (
            <AppStatus className={cx({ isOverdue: !isGoodsStatus, fixed })}>
              {getAppStatusText({ isGoodsStatus, isNew, fixed })}
            </AppStatus>
          )}
        </div>
        {type === 'externalApps' && projectName && (
          <div className="projectName overflow_ellipsis" title={projectName}>
            {projectName}
          </div>
        )}
      </div>
      <div
        className="markAppWrap"
        onClick={e => {
          e.stopPropagation();
          handleMarkApp({ projectId, appId: id, isMark: !isMarked }, e);
        }}>
        <Icon icon={isMarked ? 'task-star' : 'star-hollow'} />
      </div>
    </li>
  ),
);
