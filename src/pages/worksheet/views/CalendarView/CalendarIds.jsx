import React, { Component } from 'react';
import { useSetState } from 'react-use';
import cx from 'classnames';
import moment from 'moment';
import Trigger from 'rc-trigger';
import addRecord from 'worksheet/common/newRecord/addRecord';
import { browserIsMobile } from 'src/utils/common';
import { controlState } from 'src/utils/control';
import { dateConvertToServerZone } from 'src/utils/project';
import { WrapChoose } from './styles';

export default function (props) {
  const {
    item,
    calendarInfo,
    isHide,
    canNew,
    calendarview,
    changeEventFn = () => {},
    selectTimeInfo = {},
    changeData = {},
    onChangeState = () => {},
    base = {},
    getEventsFn = () => {},
    updateCalendarEventIsAdd,
    onChangeClickData,
    random,
  } = props;
  if (!canNew) {
    return '';
  }
  const [{ popupVisible }, setState] = useSetState({
    popupVisible: false,
  });
  let date = moment(item.date).format('YYYY-MM-DD');
  const addRecordInfo = defaultFormData => {
    const { worksheetId } = base;
    addRecord({
      showFillNext: true,
      worksheetId: worksheetId,
      defaultFormData,
      defaultFormDataEditable: true,
      directAdd: true,
      onAdd: record => {
        $('.fc-highlight').remove();
        getEventsFn();
        updateCalendarEventIsAdd(true);
        onChangeClickData(null);
        onChangeState({ changeData: null });
      },
    });
  };
  const useViewInfoUpdate = (o, item) => {
    //他表 公式 汇总 作为开始时间，不支持编辑
    if ([30, 31, 38, 53, 37].includes(o.startData.type) || !controlState(o.startData).editable) {
      return alert(_l('当前日期字段不可编辑'), 3);
    }
    if (changeData && changeData.rowid) {
      changeEventFn({
        ...item,
        ...selectTimeInfo,
        ...changeData,
        rowId: changeData.rowid,
        data: o,
        calendar: {
          start: changeData[o.begin],
          end: changeData[o.end],
        },
      });
    } else {
      let startT = moment(selectTimeInfo.startStr ? selectTimeInfo.startStr : item.date).format(o.startFormat);
      let endT = selectTimeInfo.endStr
        ? !selectTimeInfo.allDay
          ? moment(selectTimeInfo.endStr).format(o.endFormat)
          : `${moment(selectTimeInfo.endStr).subtract(1, 'day').format('YYYY-MM-DD')} 23:59:59`
        : '';
      let data = selectTimeInfo.startStr
        ? {
            [o.begin]: dateConvertToServerZone(startT),
            [o.end]: dateConvertToServerZone(endT),
          }
        : {
            [o.begin]: dateConvertToServerZone(startT),
          };
      addRecordInfo(data);
      onChangeState({ selectTimeInfo: {} });
    }
  };
  const renderPopup = item => {
    const { calendarData = {} } = calendarview;
    const { calendarInfo = [] } = calendarData;
    return (
      <WrapChoose>
        {calendarInfo.map(o => {
          return (
            <div
              className="setLi Hand WordBreak overflow_ellipsis"
              onClick={() => {
                setState({ popupVisible: '' });
                useViewInfoUpdate(o, item);
              }}
            >
              {_l('使用%0', o.mark || o.startData.controlName)}
            </div>
          );
        })}
      </WrapChoose>
    );
  };
  return (
    <Trigger
      popupVisible={popupVisible === `${date}`}
      action={['click']}
      popup={renderPopup(item)}
      getPopupContainer={() => document.body}
      onPopupVisibleChange={visible => {
        if (browserIsMobile()) return;
        if (visible) {
          if (calendarInfo.length <= 1) {
            useViewInfoUpdate(calendarInfo[0], item);
          } else {
            setState({ popupVisible: `${date}` });
          }
        } else {
          setState({ popupVisible: '' });
        }
      }}
      popupAlign={{
        points: ['tc', 'bc'],
        offset: [0, 12],
        overflow: { adjustX: true, adjustY: true },
      }}
    >
      <span
        className={cx('add', { isTop: item.view.type !== 'dayGridMonth', Alpha0: isHide })}
        data-date={`${date}-${random}`}
      >
        +
      </span>
    </Trigger>
  );
}
