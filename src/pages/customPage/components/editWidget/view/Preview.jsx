import React, { useRef, useState, useEffect } from 'react';
import styled from 'styled-components';
import cx from 'classnames';
import { LoadDiv } from 'ming-ui';
import { browserIsMobile, getTranslateInfo } from 'src/util';
import { navigateTo } from 'src/router/navigateTo';
import homeAppApi from 'src/api/homeApp';
import _ from 'lodash';

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
    border-bottom: 1px solid #eaeaea;
    &.mobile {
      font-size: 14px;
      height: 44px;
      background-color: #f8f8f8;
    }
  }
  .SingleViewName + div {
    display: none;
  }
  .SingleViewBody {
    border: none !important;
  }
  &.hideAddRecord .addRecord,
  &.hideAddRecord .addBoardRecord,
  &.hideAddRecord .addRecordItemWrapper,
  &.hideSearchRecord .icon-search,
  &.hideSearchRecord .searchWrapper, 
  &.hideSearchRecord .mapSearchRecordAutoComplete {
    display: none !important;
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
    .calendarCon .worksheetFullCalendar,
    .SingleViewWrap .addRecord {
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

const navigateToView = (workSheetId, viewId) => {
  homeAppApi
    .getAppSimpleInfo({
      workSheetId,
    })
    .then(data => {
      const { appId, appSectionId } = data;
      if (window.isMingDaoApp) {
        window.location.href = `/mobile/recordList/${appId}/${appSectionId}/${workSheetId}/${viewId}`;
      } else if (isMobile) {
        window.mobileNavigateTo(`/mobile/recordList/${appId}/${appSectionId}/${workSheetId}/${viewId}`);
      } else {
        navigateTo(`/app/${appId}/${appSectionId}/${workSheetId}/${viewId}`);
      }
    });
};

export function View(props) {
  const { appId, setting = {}, className, layoutType, filtersGroup = [] } = props;
  const { id, apkId, value, viewId, config = {} } = setting;
  const singleViewRef = useRef();
  const isMobileLayout = isMobile || layoutType === 'mobile';
  const translateInfo = getTranslateInfo(appId, null, id);
  const [Component, setComponent] = useState(null);

  useEffect(() => {
    if (isMobileLayout) {
      import('mobile/components/SingleView').then(component => {
        setComponent(component.default);
      });
    } else {
      import('worksheet/common/SingleView').then(component => {
        setComponent(component.default);
      });
    }
  }, []);

  if (!Component) return null;

  if (_.isEmpty(viewId)) {
    return (
      <EmptyView className="SingleViewWrap valignWrapper emptyView">
        <div className="Font15 Gray_9e">{_l('请先选择一个视图')}</div>
      </EmptyView>
    );
  }

  return (
    <ViewWrap className={cx(className, { hideAddRecord: !config.isAddRecord, hideSearchRecord: !config.searchRecord })}>
      <Component
        showHeader
        ref={singleViewRef}
        appId={apkId || appId}
        worksheetId={value}
        viewId={viewId}
        maxCount={config.maxCount}
        pageSize={config.pageCount}
        authRefreshTime={config.refresh}
        filtersGroup={filtersGroup}
        config={config}
        headerLeft={
          <div className="SingleViewName flex ellipsis">
            <span
              className={cx('Font15 bold Gray', { pointer: config.openView })}
              onClick={() => {
                if (config.openView) {
                  navigateToView(value, viewId);
                }
              }}
            >
              {translateInfo.name || config.name}
            </span>
          </div>
        }
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
        <View className="disableSingleView" appId={appId} setting={setting} />
      )}
    </Wrap>
  );
}
