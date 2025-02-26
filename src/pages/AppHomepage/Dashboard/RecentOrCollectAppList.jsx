import React, { useEffect, useRef, useState, forwardRef } from 'react';
import styled from 'styled-components';
import cx from 'classnames';
import { Icon, Tooltip, SvgIcon, SortableList } from 'ming-ui';
import autoSize from 'ming-ui/decorators/autoSize';
import AppStatusComp from '../AppCenter/components/AppStatus';
import { getAppNavigateUrl, transferExternalLinkUrl } from '../AppCenter/utils';
import { addBehaviorLog } from 'src/util';
import { getAppOrItemColor } from './utils';
import collectAppEmptyPng from 'staticfiles/images/collect_app.png';
import recentEmptyPng from 'staticfiles/images/time.png';
import _ from 'lodash';
import { navigateTo } from 'src/router/navigateTo';
import { navigateToAppItem } from 'src/pages/widgetConfig/util/data';
import './style.less';

const Wrapper = styled.div`
  display: flex;
  overflow: hidden;
  margin: 0;
  padding: 0 20px;

  .listWrapper {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    &.isFold {
      max-height: 116px;
    }
  }
  .appItemWrapper {
    flex: 1;
    min-width: 180px;
    height: 50px;
    border-radius: 8px;
    margin: 4px 0;
    cursor: pointer;
    &:hover {
      background: #f8f8f8;
      .markStarIcon {
        display: block;
      }
    }
  }
`;

const AppItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;

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
  .textContent {
    margin-left: 10px;
    min-width: 0;
    .titleName {
      font-size: 14px;
      color: #151515;
    }
    .appName {
      font-size: 12px;
      color: #999;
    }
  }
  .markStarIcon {
    display: none;
    text-align: center;
    width: 32px;
    height: 32px;
    min-width: 32px;
    line-height: 32px;
    margin-right: -4px;
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

const ListItemSkeleton = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 48px;
  margin-bottom: 20px;
  .iconSkeleton {
    width: 32px;
    height: 32px;
    min-width: 32px;
    border-radius: 50%;
    background: #f6f6f6;
  }
  .textSkeleton {
    width: 60px;
    height: 20px;
    border-radius: 11px;
    background: #f6f6f6;
    margin-left: 6px;
  }
`;

const RecentOrCollectAppList = forwardRef((props, ref) => {
  const {
    apps = [],
    loading,
    isCollect,
    onAppSorted,
    projectId,
    appLang,
    isFold,
    setIsOverflow,
    width,
    draggable,
    onMarkApp,
  } = props;
  const [sortIds, setSortIds] = useState([]);
  const [blankBlockCount, setBlankBlockCount] = useState(0);
  const listRef = useRef();
  const minWidth = 180;

  useEffect(() => {
    setSortIds(apps.map(item => (!!item.type ? item.itemId : item.id)));
  }, [apps]);

  useEffect(() => {
    const columnSize = Math.floor((width - 40) / minWidth);
    const number = apps.length % columnSize;
    setBlankBlockCount(!number ? 0 : columnSize - number);

    setTimeout(() => {
      setIsOverflow && setIsOverflow(listRef.current && listRef.current.scrollHeight > 116);
    }, 100);
  }, [apps, listRef.current, width]);

  const renderListSkeleton = () => {
    return Array.from({ length: 6 }).map((_, index) => {
      return (
        <ListItemSkeleton key={index}>
          <div className="iconSkeleton"></div>
          <div className="textSkeleton"></div>
        </ListItemSkeleton>
      );
    });
  };

  const renderEmpty = () => {
    return (
      <div className="emptyWrapper">
        <img src={isCollect ? collectAppEmptyPng : recentEmptyPng} />
        {isCollect ? <span>{_l('没有收藏')}</span> : <span>{_l('没有最近使用')}</span>}
      </div>
    );
  };

  const renderItem = ({ item }) => {
    const appName = _.get(_.find(appLang, { key: item.id }), 'value') || item.name;
    const itemName = _.get(_.find(appLang, { key: item.itemId }), 'value') || item.itemName;

    const onAddBehaviorLog = item => {
      switch (item.type) {
        case 0:
          addBehaviorLog('app', item.id);
          break;
        case 1:
          addBehaviorLog('customPage', item.itemId);
          break;
        case 2:
          addBehaviorLog('worksheet', item.itemId);
          break;
        default:
          addBehaviorLog('app', item.id);
          break;
      }
    };

    return (
      <AppItem
        onClick={e => {
          e.stopPropagation();
          e.preventDefault();

          onAddBehaviorLog(item); // 浏览应用/应用项埋点
          if (item.createType === 1) {
            //是外部链接应用
            window.open(transferExternalLinkUrl(item.urlTemplate, projectId, item.id));
          } else {
            !!item.type
              ? navigateToAppItem(item.itemId)
              : navigateTo(getAppNavigateUrl(item.id, item.pcNaviStyle, item.selectAppItmeType));
          }
        }}
      >
        <div className="flexRow alignItemsCenter">
          <div
            className="appIcon"
            style={{
              backgroundColor: !!item.type ? getAppOrItemColor(item, true).bg : getAppOrItemColor(item).bg,
            }}
          >
            <SvgIcon
              url={!!item.type ? item.itemUrl : item.iconUrl}
              fill={!!item.type ? getAppOrItemColor(item, true).iconColor : getAppOrItemColor(item).iconColor}
              size={20}
            />
            <AppStatusComp {..._.pick(item, ['isGoodsStatus', 'isNew', 'fixed', 'appStatus'])} isRecent={true} />
          </div>
          <div className="textContent">
            <div className="titleName overflow_ellipsis" title={!!item.type ? itemName : appName}>
              {!!item.type ? itemName : appName}
            </div>
            {!!item.type && (
              <div className="appName overflow_ellipsis" title={appName}>
                {appName}
              </div>
            )}
          </div>
        </div>
        <Tooltip text={item.isMarked ? _l('取消收藏') : _l('收藏')} popupPlacement="bottom">
          <div
            className="markStarIcon stopPropagation"
            onClick={e => {
              e.stopPropagation();
              e.preventDefault();
              onMarkApp({
                projectId,
                isMark: !item.isMarked,
                appId: item.id,
                ..._.pick(item, ['type', 'itemId', 'itemName', 'itemUrl']),
              });
            }}
          >
            <Icon className="Font16" icon={item.isMarked ? 'task-star' : 'star-hollow'} />
          </div>
        </Tooltip>
      </AppItem>
    );
  };

  return (
    <Wrapper>
      {loading && renderListSkeleton()}
      {!loading &&
        (!apps.length ? (
          renderEmpty()
        ) : (
          <div ref={listRef} className={cx('listWrapper', { isFold })}>
            <SortableList
              canDrag={draggable}
              items={sortIds
                .map(id => {
                  const it = _.find(apps, app => (!!app.type ? app.itemId === id : app.id === id));

                  return it ? { ...it, uniqueId: `${it.id}-${it.itemId}` } : undefined;
                })
                .filter(item => !_.isUndefined(item))}
              renderItem={renderItem}
              itemKey="uniqueId"
              itemClassName="appItemWrapper"
              helperClass="collectAppDragItem"
              onSortEnd={newItems => {
                const newSortIds = newItems.map(app => (!!app.type ? app.itemId : app.id));
                setSortIds(newSortIds);
                onAppSorted({ appIds: newSortIds, projectId, sortType: 1 });
              }}
            />

            {!!blankBlockCount &&
              Array.from({ length: blankBlockCount }).map((_, index) => (
                <div key={index} className="Visibility appItemWrapper" />
              ))}
          </div>
        ))}
    </Wrapper>
  );
});

export default autoSize(RecentOrCollectAppList);
