import React from 'react';
import styled from 'styled-components';
import { Icon, MdLink, Tooltip } from 'ming-ui';
import SvgIcon from 'src/components/SvgIcon';
import AppStatusComp from './AppStatus';
import { getAppNavigateUrl } from '../utils';
import { canEditApp } from 'src/pages/worksheet/redux/actions/util.js';

const Wrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  max-height: 116px;
  overflow: hidden;
  margin: 16px -4px 24px;
`;

const AppItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 200px;
  height: 50px;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  &:hover {
    background: #f8f8f8;
    .markStarIcon {
      display: block;
    }
  }

  .appIcon {
    width: 32px;
    height: 32px;
    min-width: 32px;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
  }
  .appName {
    font-size: 14px;
    color: #333;
    margin-left: 10px;
    overflow: hidden;
    -webkit-line-clamp: 2;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    word-break: break-all;
  }
  .markStarIcon {
    display: none;
    text-align: center;
    width: 32px;
    height: 32px;
    min-width: 32px;
    line-height: 32px;
    margin-right: 4px;
    border-radius: 8px;
    &:hover {
      background: #fff;
    }

    .icon-task-star {
      color: #f9ce1d;
    }
    .icon-star-hollow {
      color: #9e9e9e;
      &:hover {
        color: #1e88e5;
      }
    }
  }
`;

export default function RecentAppList(props) {
  const { projectId, apps, onMarkApp, pcNaviStyle } = props;

  const getBackgroundColor = appItem => {
    const iconColor = appItem.iconColor || '#2196f3';
    const navColor = appItem.navColor || iconColor;
    const black = '#1b2025' === navColor;
    const light = [appItem.lightColor, '#ffffff', '#f5f6f7'].includes(navColor);
    return {
      bg: light ? appItem.lightColor : navColor || iconColor,
      iconColor: iconColor,
      black: black,
      light: light,
    };
  };

  return (
    <Wrapper>
      {apps.map((item, index) => {
        return (
          <MdLink className="mBottom8" to={getAppNavigateUrl(item.id, pcNaviStyle)}>
            <AppItem key={item.id || index}>
              <div className="flexRow alignItemsCenter">
                <div className="appIcon" style={{ backgroundColor: getBackgroundColor(item).bg }}>
                  <SvgIcon
                    url={item.iconUrl}
                    fill={
                      getBackgroundColor(item).black || getBackgroundColor(item).light
                        ? getBackgroundColor(item).iconColor
                        : '#fff'
                    }
                    size={20}
                  />
                  <AppStatusComp {..._.pick(item, ['isGoodsStatus', 'isNew', 'fixed'])} isRecent={true} />
                </div>
                <div className="appName" title={item.name}>
                  {item.name}
                </div>
              </div>
              <Tooltip text={item.isMarked ? _l('取消标星') : _l('标星')} popupPlacement="bottom">
                <div
                  className="markStarIcon stopPropagation"
                  onClick={e => {
                    e.stopPropagation();
                    e.preventDefault();
                    onMarkApp({ appId: item.id, projectId, isMark: !item.isMarked });
                  }}
                >
                  <Icon className="Font16" icon={item.isMarked ? 'task-star' : 'star-hollow'} />
                </div>
              </Tooltip>
            </AppItem>
          </MdLink>
        );
      })}
    </Wrapper>
  );
}
