import React, { memo } from 'react';
import { string } from 'prop-types';
import { navigateTo } from 'src/router/navigateTo';
import { Icon, MdLink } from 'ming-ui';
import styled from 'styled-components';
import cx from 'classnames';
import { getAppStatusText } from 'src/pages/PageHeader/util';
import SvgIcon from 'src/components/SvgIcon';
import _ from 'lodash';

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

function SideAppItem({
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
  fixed,
}) {
  const storage = JSON.parse(localStorage.getItem(`mdAppCache_${md.global.Account.accountId}_${id}`));
  return (
    <MdLink
      key={id}
      to={
        storage
          ? `/app/${id}/${_.filter(
              [storage.lastGroupId, storage.lastWorksheetId, storage.lastViewId],
              item => !!item,
            ).join('/')}?from=insite`
          : `/app/${id}`
      }
      onClick={e => {
        if (!e.ctrlKey && !e.metaKey) {
          closeIndexSide();
        }
      }}
    >
      <li>
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
          }}
        >
          <Icon icon={isMarked ? 'task-star' : 'star-hollow'} />
        </div>
      </li>
    </MdLink>
  );
}
export default memo(SideAppItem);
