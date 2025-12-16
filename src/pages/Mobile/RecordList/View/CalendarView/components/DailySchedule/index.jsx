import React, { forwardRef, Fragment, memo, useImperativeHandle } from 'react';
import { useSetState } from 'react-use';
import _ from 'lodash';
import { MobileSearch, PopupWrapper, ScrollView } from 'ming-ui';
import RecordCard from 'mobile/RecordList/RecordCard';
import { getFormateView } from '../../util';
import EmptyStatus from '../EmptyStatus';
import './index.less';

const DailySchedule = forwardRef((props, ref) => {
  const {
    dailyScheduleData = [],
    base = {},
    visible,
    controls = [],
    worksheetInfo = {},
    view = {},
    onClose,
    title,
    openRecord,
  } = props;
  const titleControlId = _.find(controls, control => control.attribute === 1)?.controlId;
  const [{ filterData, keywords }, setState] = useSetState({
    searchValue: '',
    filterData: dailyScheduleData,
    keywords: '',
  });

  const handleClose = () => {
    onClose();
    setState({
      filterData: [],
    });
  };

  // 数据搜索
  const searchResult = (keywords, data = dailyScheduleData) => {
    if (!keywords) {
      setState({ filterData: data, keywords });
      return;
    }
    let filterData = data.filter(({ extendedProps }) => extendedProps[titleControlId]?.includes(keywords));
    setState({ filterData, keywords });
  };

  useImperativeHandle(ref, () => ({
    updateDailyScheduleData: data => {
      searchResult(keywords, data);
    },
  }));

  return (
    <Fragment>
      <PopupWrapper
        className="dailySchedulePopup"
        bodyClassName="heightPopupBody40"
        title={title}
        visible={visible}
        onClose={handleClose}
        headerType="withIcon"
      >
        <div className="h100 flexColumn">
          <MobileSearch placeholder={_l('搜索记录')} onSearch={searchResult} />
          <ScrollView className="flex">
            {filterData.length > 0 ? (
              <div className="weeklyCalendarContentList">
                {filterData.map(item => (
                  <RecordCard
                    key={`${item.originalProps.rowid}-${item.mark}`}
                    data={item.originalProps}
                    view={getFormateView(view, item)}
                    appId={base.appId}
                    projectId={worksheetInfo.projectId}
                    controls={controls}
                    mark={item.mark}
                    onClick={() => openRecord(item.originalProps)}
                  />
                ))}
              </div>
            ) : (
              <EmptyStatus />
            )}
          </ScrollView>
        </div>
      </PopupWrapper>
    </Fragment>
  );
});

export default memo(DailySchedule);
