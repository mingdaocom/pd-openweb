import React, { useCallback, useMemo, useRef, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { LoadDiv, ScrollView } from 'ming-ui';
import worksheetAjax from 'src/api/worksheet';
import { getCoverStyle } from 'src/pages/worksheet/common/ViewConfig/utils';
import NoRecords from 'src/pages/worksheet/components/WorksheetTable/components/NoRecords';
import { emitter, pathCompletion } from 'src/utils/common';
import { getAdvanceSetting } from 'src/utils/control';
import { addBehaviorLog } from 'src/utils/project';
import { handleRecordClick } from 'src/utils/record';
import ViewEmpty from '../../components/ViewEmpty';
import { useGalleryFetchEffect } from '../hooks/useGalleryFetchEffect';
import RecordInfoForGallery from '../RecordInfoForGallery';
import { getWidth } from '../util';
import GalleryContent from './GalleryContent';

const LoadingIndicator = ({ loading }) =>
  loading && (
    <div className="w100">
      <LoadDiv size="big" className="mTop32" />
    </div>
  );

const EmptyState = ({ filters = {}, isFiltered }) => {
  if (filters.keyWords || !_.isEmpty(filters.filterControls)) {
    return <ViewEmpty filters={filters} />;
  }

  return <NoRecords sheetIsFiltered={isFiltered} />;
};

// 判断当前画廊是否处于无筛选状态，用于区分空数据和筛选无结果。
const noFilter = (filters = {}) => {
  const { searchType, filterControls, isUnRead, sortControls = [] } = filters;
  return (
    searchType === 1 &&
    !isUnRead &&
    !filterControls.length &&
    !sortControls.filter(item => item.controlId === 'ctime' || item.controlId === 'utime').length
  );
};

const RecordGalleryInner = props => {
  const { base = {}, galleryview = {}, filters = {}, views = [] } = props;
  const { gallery = [], galleryViewLoading, galleryLoading } = galleryview;
  const [recordInfo, setRecordInfo] = useState({
    recordInfoVisible: false,
    recordId: '',
    rowKey: '',
  });
  const [clicksearch, setClicksearch] = useState('');
  const [opKeys, setOpKeys] = useState([]);
  const propsRef = useRef(props);

  // 滚动加载和记录刷新事件依赖最新视图数据，用 ref 避免闭包读到旧列表。
  propsRef.current = props;

  const currentView = views.find(o => o.viewId === base.viewId) || {};
  const cardWidth = getWidth(props);

  // 根据点击查询配置决定首屏是否直接加载记录。
  const getFetch = useCallback(nextProps => {
    const { base = {}, views = [] } = nextProps;
    const currentView = views.find(o => o.viewId === base.viewId) || {};
    const { clicksearch } = getAdvanceSetting(currentView);

    if (clicksearch === '1') {
      setClicksearch(clicksearch);
      nextProps.changeIndex(0);
      return;
    }

    nextProps.fetch(1);
  }, []);

  // 详情页关闭或外部刷新记录时，同步画廊中的当前卡片数据。
  const updateRecordEvent = useCallback(({ worksheetId, recordId, rowKey }) => {
    const { base = {}, galleryview = {} } = propsRef.current;
    const { gallery = [] } = galleryview;

    if (worksheetId === propsRef.current.worksheetId && _.find(gallery, r => r.rowid === recordId)) {
      worksheetAjax
        .getRowDetail({
          checkView: true,
          getType: 1,
          rowId: recordId,
          viewId: base.viewId,
          worksheetId,
        })
        .then(res => {
          const row = safeParse(res.rowData) || {};

          if (res.resultCode === 1 && res.isViewData) {
            propsRef.current.updateRow(row, rowKey);
          } else {
            propsRef.current.deleteRow(row.rowid, rowKey);
          }
        });
    }
  }, []);

  React.useEffect(() => {
    emitter.addListener('RELOAD_RECORD_INFO', updateRecordEvent);

    return () => {
      emitter.removeListener('RELOAD_RECORD_INFO', updateRecordEvent);
    };
  }, [updateRecordEvent]);

  useGalleryFetchEffect(props, {
    clicksearch,
    setClicksearch,
    setOpKeys,
    getFetch,
  });

  // 普通画廊滚动到底部时加载下一页，分组画廊使用组内“查看更多”。
  const scrollLoad = useMemo(
    () =>
      _.throttle(() => {
        const { base = {}, views = [], galleryview = {} } = propsRef.current;
        const currentView = views.find(o => o.viewId === base.viewId) || {};

        if (!base.maxCount && !_.get(currentView, 'advancedSetting.groupsetting')) {
          const { galleryViewRecordCount, gallery, galleryLoading, galleryIndex } = galleryview;

          if (gallery.length < galleryViewRecordCount && !galleryLoading) {
            propsRef.current.fetch(galleryIndex + 1);
          }
        }
      }, 400),
    [],
  );

  React.useEffect(() => {
    return () => {
      scrollLoad.cancel();
    };
  }, [scrollLoad]);

  // 处理卡片点击：移动端可跳新页面，PC 端打开记录详情层。
  const onRecordClick = useCallback((currentView, item, rowKey) => {
    const {
      base: { appId, worksheetId, viewId },
    } = propsRef.current;

    handleRecordClick(currentView, item, () => {
      if (window.isMingDaoApp && window.APP_OPEN_NEW_PAGE) {
        window.location.href = pathCompletion(`/mobile/record/${appId}/${worksheetId}/${viewId}/${item.rowid}`);
        return;
      }

      setRecordInfo({ recordId: item.rowid, recordInfoVisible: true, rowKey });
      addBehaviorLog('worksheetRecord', worksheetId, { rowId: item.rowid });
    });
  }, []);

  const { coverPosition = '2' } = getCoverStyle(currentView);
  const isTopCover = coverPosition === '2';

  if (galleryViewLoading) return <LoadDiv size="big" className="mTop32" />;
  if (gallery.length <= 0) return <EmptyState filters={filters} isFiltered={!noFilter(filters)} />;

  return (
    <ScrollView className="galleryScrollWrap" onScrollEnd={scrollLoad}>
      <div className={cx('galleryViewContentWrap', { coverTop: isTopCover })}>
        <GalleryContent
          {...props}
          currentView={currentView}
          cardWidth={cardWidth}
          opKeys={opKeys}
          setOpKeys={setOpKeys}
          onRecordClick={onRecordClick}
        />
        {recordInfo.recordInfoVisible && (
          <RecordInfoForGallery
            {...props}
            state={recordInfo}
            onChangeState={info => setRecordInfo(prev => ({ ...prev, ...info }))}
            updateRecordEvent={updateRecordEvent}
          />
        )}
      </div>
      <LoadingIndicator loading={galleryLoading} />
    </ScrollView>
  );
};

export default RecordGalleryInner;
