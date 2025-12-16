import React, { Fragment, memo, useEffect, useRef } from 'react';
import { useSetState } from 'react-use';
import { Icon, LoadDiv, MobileSearch, PopupWrapper, ScrollView } from 'ming-ui';
import RecordCard from 'mobile/RecordList/RecordCard';
import EmptyStatus from '../EmptyStatus';
import './index.less';

const ScheduleModal = props => {
  const {
    view,
    base,
    worksheetInfo,
    controls,
    calenderNotScheduled = {},
    getNotScheduledEventList,
    resetCalendarNotScheduled,
    openRecord,
    refreshCalendarViewData,
  } = props;
  const { list = [], hasMore, loading, total = 0 } = calenderNotScheduled;

  const scrollViewRef = useRef(null);
  const isInit = useRef(true);

  const [{ visible, pageIndex, keyWords }, setState] = useSetState({
    visible: false,
    pageIndex: 1,
    keyWords: '',
  });

  const onScrollEnd = () => {
    if (loading || !hasMore) return;

    setState({ pageIndex: pageIndex + 1 });
  };

  const handleSearch = keywords => {
    setState({ keyWords: keywords, pageIndex: 1 });
  };

  useEffect(() => {
    if (visible) {
      getNotScheduledEventList({ pageIndex, keyWords });
    }
  }, [pageIndex, keyWords]);

  useEffect(() => {
    // 初始化时先获取未排期数量，关闭弹层时重新获取一次，避免数据不一致
    if (visible) {
      getNotScheduledEventList();
      isInit.current = false;
    }
    // 关闭弹层，重置数据，刷新日历视图
    if (!visible && !isInit.current) {
      setState({ pageIndex: 1, keyWords: '' });
      resetCalendarNotScheduled();
      refreshCalendarViewData();
    }
  }, [visible]);

  return (
    <Fragment>
      <div className="scheduleIconBox" onClick={() => setState({ visible: true })}>
        <Icon className="scheduleIcon" icon="abstract" />
        {total > 0 && <div className="totalNum">{total}</div>}
      </div>
      {visible && (
        <PopupWrapper
          className="schedulePopup"
          bodyClassName="heightPopupBody40"
          title={_l('未排期')}
          visible={visible}
          onClose={() => setState({ visible: false })}
          headerType="withIcon"
        >
          <div className="h100 flexColumn">
            <MobileSearch placeholder={_l('搜索记录')} onSearch={handleSearch} />
            <ScrollView className="flex" ref={scrollViewRef} onScrollEnd={onScrollEnd}>
              {list.length > 0 && (
                <div className="eventListBox">
                  {list.map(item => (
                    <RecordCard
                      key={item.rowid}
                      data={item}
                      view={view}
                      appId={base.appId}
                      projectId={worksheetInfo.projectId}
                      controls={controls}
                      onClick={() => openRecord(item)}
                    />
                  ))}
                </div>
              )}
              {list.length === 0 && !loading && <EmptyStatus title={_l('无未排期日程')} />}
              {loading && (
                <div className="scheduleLoading">
                  <LoadDiv />
                </div>
              )}
            </ScrollView>
          </div>
        </PopupWrapper>
      )}
    </Fragment>
  );
};

export default memo(ScheduleModal);
