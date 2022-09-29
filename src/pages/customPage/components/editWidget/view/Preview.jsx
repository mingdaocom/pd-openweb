import React, { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';
import cx from 'classnames';
import SingleView from 'worksheet/common/SingleView';
import MobileSingleView from 'mobile/components/SingleView';
import { Icon, Tooltip, LoadDiv } from 'ming-ui';
import { browserIsMobile } from 'src/util';
import { navigateTo } from 'src/router/navigateTo';
import homeAppApi from 'src/api/homeApp';

const Wrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  background-color: #eaeaea;
  padding: 24px;
  min-width: 0;

  .SingleViewWrap {
    border-radius: 4px;
    box-shadow: 0px 1px 4px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    background-color: #fff;
  }
`;

const EmptyView = styled.div`
  width: 100%;
  height: 100%;
  justify-content: center;
`;

const ViewWrap = styled.div`
  width: 100%;
  height: 100%;
  .SingleViewHeader {
    font-size: 17px;
    height: 50px;
    padding: 10px 16px;
    align-items: center;
    border-bottom: 1px solid #EAEAEA;
    &.mobile {
      font-size: 14px;
      height: 44px;
      background-color: #F8F8F8;
    }
  }
  .SingleViewName +div {
    display: none;
  }
  .SingleViewBody {
    border: none !important;
  }
  &.hideAddRecord .addRecord,
  &.hideAddRecord .addBoardRecord,
  &.hideSearchRecord .icon-search,
  &.hideSearchRecord .searchWrapper {
    display: none;
  }
  &.disableSingleView {
    .SingleViewHeader,
    .SingleViewBody .searchWrapper,
    .worksheetSheet .quickFilterWrap,
    .worksheetSheet .groupFilterWrap,
    .worksheetSheet .mdTableContent,
    .gunterView .gunterRecord,
    .gunterView .recordBlock,
    .gunterView .milepostRecordBlock,
    .structureViewWrap .nodeWrap,
    .structureViewWrap .hierarchyViewLeftBoundary,
    .worksheetBoardViewWrap .boardDataRecordItemWrap,
    .worksheetBoardViewWrap .addBoardRecord,
    .galleryViewContentWrap .galleryItem,
    .calendarCon .scheduleBtn,
    .calendarCon .worksheetFullCalendar  {
      pointer-events: none;
    }
  }
  .mobileBoxCalendar {
    .fc-header-toolbar .fc-toolbar-chunk:nth-child(2) > div .fc-button-primary:first-child {
      padding: 0 !important;
    }
  }
`;

const isMobile = browserIsMobile();
const isPublicShare = location.href.includes('public/page');

const navigateToView = (workSheetId, viewId) => {
  const isMingdao = navigator.userAgent.toLowerCase().indexOf('mingdao application') >= 0;
  homeAppApi.getAppSimpleInfo({
    workSheetId
  }).then(data => {
    const { appId, appSectionId } = data;
    if (isMingdao) {
      window.location.href = `/mobile/recordList/${appId}/${appSectionId}/${workSheetId}/${viewId}`;
    } else if (isMobile) {
      window.mobileNavigateTo(`/mobile/recordList/${appId}/${appSectionId}/${workSheetId}/${viewId}`);
    } else {
      navigateTo(`/app/${appId}/${appSectionId}/${workSheetId}/${viewId}`);
    }
  });
}

export function View(props) {
  const { appId, setting, className, layoutType, filtersGroup = [] } = props;
  const { value, viewId, config = {} } = setting;
  const singleViewRef = useRef();
  const isMobileLayout = isMobile || layoutType === 'mobile';

  if (isPublicShare) {
    return (
      <EmptyView className="SingleViewWrap valignWrapper emptyView">
        <div className="Font15 Gray_9e">{_l('暂不支持显示视图组件')}</div>
      </EmptyView>
    );
  }

  if (_.isEmpty(viewId)) {
    return (
      <EmptyView className="SingleViewWrap valignWrapper emptyView">
        <div className="Font15 Gray_9e">{_l('请先选择一个视图')}</div>
      </EmptyView>
    );
  }

  const Component = isMobileLayout ? MobileSingleView : SingleView;

  return (
    <ViewWrap className={cx(className, { hideAddRecord: !config.isAddRecord, hideSearchRecord: !config.searchRecord })}>
      <Component
        showHeader
        ref={singleViewRef}
        appId={appId}
        worksheetId={value}
        viewId={viewId}
        maxCount={config.maxCount}
        filtersGroup={filtersGroup}
        headerLeft={(
          <div className="SingleViewName flex ellipsis">
            <span
              className={cx('Font15 bold Gray', { pointer: config.openView })}
              onClick={() => {
                if (config.openView) {
                  navigateToView(value, viewId);
                }
              }}
            >
              {config.name}
            </span>
          </div>
        )}
      />
    </ViewWrap>
  );
}

export default function Preview(props) {
  const { loading, ids = {}, setting } = props;
  const { appId } = ids;

  return (
    <Wrap>
      {loading ? (
        <EmptyView className="SingleViewWrap valignWrapper emptyView">
          <LoadDiv />
        </EmptyView>
      ) : (
        <View
          className="disableSingleView"
          appId={appId}
          setting={setting}
        />
      )}
    </Wrap>
  );
}
