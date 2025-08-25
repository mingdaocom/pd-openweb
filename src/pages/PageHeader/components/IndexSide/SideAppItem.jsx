import React, { memo } from 'react';
import cx from 'classnames';
import styled from 'styled-components';
import { Icon, MdLink, SvgIcon, Tooltip } from 'ming-ui';
import { getAppNavigateUrl, transferExternalLinkUrl } from 'src/pages/AppHomepage/AppCenter/utils';
import { getAppStatusText } from 'src/pages/PageHeader/util';
import { addBehaviorLog } from 'src/utils/project';

const AppStatus = styled.div`
  border-radius: 10px;
  padding: 0 8px;
  line-height: 22px;
  box-sizing: border-box;
  background: #151515;
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
  pcNaviStyle,
  selectAppItmeType,
  createType,
  urlTemplate,
}) {
  return (
    <MdLink
      className="stopPropagation"
      key={id}
      to={getAppNavigateUrl(id, pcNaviStyle, selectAppItmeType)}
      onClick={e => {
        addBehaviorLog('app', id); // 浏览应用埋点

        if (createType === 1) {
          //应用为外部链接类型
          e.stopPropagation();
          e.preventDefault();
          window.open(transferExternalLinkUrl(urlTemplate, projectId, id), '_blank');
        } else {
          if (!e.ctrlKey && !e.metaKey) {
            closeIndexSide();
          }
        }
      }}
    >
      <li>
        <div className="iconWrap" style={{ backgroundColor: iconColor || '#1677ff' }}>
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
            e.preventDefault();
            handleMarkApp({ projectId, appId: id, isMark: !isMarked }, e);
          }}
        >
          <Tooltip popupPlacement={'bottom'} text={isMarked ? _l('取消收藏') : _l('收藏')}>
            <Icon icon={isMarked ? 'task-star' : 'star-hollow'} />
          </Tooltip>
        </div>
      </li>
    </MdLink>
  );
}
export default memo(SideAppItem);
