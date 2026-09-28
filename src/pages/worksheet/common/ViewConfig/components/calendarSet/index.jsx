import React, { useEffect } from 'react';
import _ from 'lodash';
import moment from 'moment';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { Checkbox, Segmented, Select, TimePicker } from 'ming-ui/antd-components';
import { TimeDropdownChoose } from 'src/pages/worksheet/common/ViewConfig/style.jsx';
import { getAdvanceSetting } from 'src/utils/domain/control/advancedSetting';
import { isTimeStyle } from 'src/utils/domain/control/type';
import { getCalendartypeData, getCalendarViewType, getTimeControls } from 'src/utils/services/worksheet/calendar';
import SelectStartOrEndGroups from '../SelectStartOrEndControl/SelectStartOrEndGroups';
import WeekdaySegmented from '../WeekdaySegmented';

let obj = [_l('月'), _l('周'), _l('日')];
let weekObj = [_l('周一'), _l('周二'), _l('周三'), _l('周四'), _l('周五'), _l('周六'), _l('周日')];
const ShowChoose = styled.div`
  > .hap-checkbox-wrapper {
    display: flex;
    width: fit-content;
    font-size: 13px;
  }
  .showtimeCon {
    border: 1px solid var(--color-border-primary);
    border-radius: 3px;
    color: var(--color-text-secondary);
    padding: 6px 12px;
    background: var(--color-background-primary);
    display: flex;
    justify-content: space-between;
    cursor: pointer;
    &:hover {
      background: var(--color-background-hover);
    }
  }
`;

const changePickerContainerLeft = () => {
  const changeLeft = () => {
    $('.hap-picker-range-arrow').css({ transition: 'none' });
    $('.hap-picker-panel-container').css({
      marginLeft: parseInt($('.hap-picker-range-arrow').css('left')),
    });
  };

  setTimeout(() => {
    $('.hap-picker-input input').on({
      click: () => changeLeft(),
      focus: () => changeLeft(),
    });
  }, 500);
};

export default function CalendarSet(props) {
  const { appId, view, updateCurrentView, worksheetControls } = props;
  const { advancedSetting = {}, worksheetId, viewId } = view;
  const {
    calendarType = '0',
    unlunar, //默认显示农历
    unweekday = '',
    rowHeight = '0',
  } = advancedSetting;
  const checkedWorkDate = unweekday !== '';
  useEffect(() => {
    changePickerContainerLeft();
  }, []);
  const handleChange = obj => {
    updateCurrentView({
      ...view,
      appId,
      advancedSetting: { ...obj },
      editAttrs: ['advancedSetting'],
      editAdKeys: Object.keys(obj),
    });
  };

  let { begindate = '', hour24 = '0', enddate, weekbegin = '1', showall = '0' } = getAdvanceSetting(view);
  let calendarcids = [];

  try {
    calendarcids = safeParse(_.get(view, ['advancedSetting', 'calendarcids']), 'array');
  } catch (error) {
    console.log(error);
    calendarcids = [];
  }

  if (calendarcids.length <= 0) {
    calendarcids = begindate //兼容老配置
      ? [{ begin: begindate, end: enddate }]
      : [
          {
            begin: (worksheetControls.filter(o => isTimeStyle(o))[0] || {}).controlId,
          },
        ];
  }

  const startData = calendarcids[0] ? worksheetControls.filter(item => item.controlId === calendarcids[0].begin) : [];
  const isDelete = calendarcids[0] && calendarcids[0].begin && (!startData || startData.length <= 0);
  return (
    <React.Fragment>
      <div className="title Font13 bold">{_l('日期')}</div>
      <SelectStartOrEndGroups
        {...props}
        controls={worksheetControls}
        begindate={begindate}
        enddate={enddate}
        handleChange={obj => {
          // const { begindate } = obj;
          const { moreSort } = view;

          // 第一次创建calendar时，配置排序数据
          if (!!begindate && !moreSort) {
            let data = {};
            data = {
              editAttrs: ['moreSort', 'sortType', 'advancedSetting'], // 'sortCid', 'sortType' 老的视图如果没配置过逻辑兼容的 现在用的moreSort
              moreSort: [{ controlId: 'ctime', isAsc: false }],
              sortType: 2,
            };
            updateCurrentView({
              ...view,
              appId,
              advancedSetting: { ...obj },
              editAttrs: ['advancedSetting'],
              editAdKeys: Object.keys(obj),
              ...data,
            });
          } else {
            handleChange(obj);
          }
        }}
        isDelete={isDelete}
        timeControls={getTimeControls(worksheetControls)}
        begindateOrFirst
      />
      <div className="flexRow">
        <div className="">
          <div className="title Font13 bold mTop32">{_l('默认视图')}</div>
          <Segmented
            className="mTop8"
            value={calendarType}
            options={obj.map((label, index) => ({ label, value: String(index) }))}
            onChange={value => {
              handleChange({ calendarType: value });
              const type = getCalendarViewType(value, startData);
              const data = getCalendartypeData();
              data[`${worksheetId}-${viewId}`] = type;
              safeLocalStorageSetItem('CalendarViewType', JSON.stringify(data));
            }}
          />
        </div>
        <div className="mLeft24">
          <div className="title Font13 bold mTop32">{_l('月视图高度')}</div>
          <Segmented
            className="mTop8"
            value={rowHeight}
            options={[
              { label: _l('紧凑'), value: '0' },
              { label: _l('宽松'), value: '1' },
            ]}
            onChange={value => handleChange({ rowHeight: value, showall: '1' })}
          />
        </div>
      </div>

      <div className="title Font13 bold mTop32">{_l('每周的第一天')}</div>
      <TimeDropdownChoose>
        <Select
          className="timeDropdown"
          value={[weekbegin]}
          optionLabelProp="label"
          placeholder={_l('请选择')}
          suffixIcon={<Icon icon="arrow-down-border Font14" />}
          classNames={{ popup: { root: 'dropConOption' } }}
          onChange={value => {
            if (value === weekbegin) {
              return;
            }

            handleChange({ weekbegin: String(value) });
          }}
          notFoundContent={_l('当前工作表中没有单选字段，请先去添加一个')}
          options={weekObj
            .map((o, i) => {
              return {
                text: o,
                value: i + 1,
              };
            })
            // .filter(o => unweekday.indexOf(o.value) < 0)
            .map(item => ({
              value: item.value + '',
              label: item.text,
              className: 'select_drop',
            }))}
        />
      </TimeDropdownChoose>
      <div className="title Font13 bold mTop32">{_l('设置')}</div>
      <ShowChoose>
        <Checkbox
          size="large"
          checked={checkedWorkDate}
          className="mTop18"
          onChange={event => {
            handleChange({
              unweekday: event.target.checked ? '67' : '',
            });
          }}
        >
          {_l('只显示工作日')}
        </Checkbox>
        {checkedWorkDate && (
          <WeekdaySegmented
            className="mTop18"
            weekdays={weekObj}
            hiddenDays={unweekday}
            onChange={value => handleChange({ unweekday: value })}
          />
        )}
        <Checkbox
          size="large"
          checked={!!_.get(props, 'view.advancedSetting.showtime')}
          className="mTop16"
          onChange={() => {
            updateCurrentView({
              ...view,
              appId,
              advancedSetting: {
                showtime: !_.get(props, 'view.advancedSetting.showtime') ? '08:00-18:00' : undefined,
              },
              editAdKeys: ['showtime'],
              editAttrs: ['advancedSetting'],
            });
            !_.get(props, 'view.advancedSetting.showtime') && changePickerContainerLeft();
          }}
        >
          {_l('只显示工作时间')}
        </Checkbox>
        {!!_.get(props, 'view.advancedSetting.showtime') && (
          <div className="flexRow timeCon alignItemsCenter mTop8">
            <TimePicker.RangePicker
              className="rangePicker w100 borderAll3 flex"
              format="HH:mm"
              value={
                _.get(props, 'view.advancedSetting.showtime')
                  ? _.get(props, 'view.advancedSetting.showtime').split('-')
                  : []
              }
              hourStep={1}
              minuteStep={60}
              classNames={{ popup: { root: 'filterDateRangeInputPopup' } }}
              onClick={() => {
                const $arrow = $(`.filterDateRangeInputPopup .hap-picker-range-arrow`);

                if ($arrow) {
                  setTimeout(() => {
                    const $arrows = $(`.filterDateRangeInputPopup .hap-picker-range-arrow`);
                    const arrowLeft = $arrows.css('left');
                    $(`.filterDateRangeInputPopup .hap-picker-panel-container`).css({
                      marginLeft: arrowLeft,
                    });
                  }, 200);
                }
              }}
              onChange={(data, timeString) => {
                if (data && data[0] && data[1] && moment(data[1]).diff(moment(data[0])) <= 0) {
                  alert(_l('结束时间不能早于或等于开始时间'), 3);
                  return;
                }

                updateCurrentView({
                  ...view,
                  appId,
                  advancedSetting: { showtime: `${timeString[0]}-${timeString[1]}` },
                  editAdKeys: ['showtime'],
                  editAttrs: ['advancedSetting'],
                });
              }}
              showNow={true}
              allowClear={false}
            />
          </div>
        )}
        <Checkbox
          size="large"
          checked={unlunar === '0'} //默认不勾选“显示中国农历”功能
          className="mTop18"
          onChange={() => {
            handleChange({
              unlunar: unlunar === '0' ? '1' : '0',
            });
          }}
        >
          {_l('显示中国农历')}
        </Checkbox>
        <Checkbox
          size="large"
          checked={hour24 === '1'}
          className="mTop18"
          onChange={() => {
            handleChange({
              hour24: hour24 !== '1' ? '1' : '0',
            });
          }}
        >
          {_l('24小时制')}
        </Checkbox>
        <Checkbox
          size="large"
          checked={showall === '1'}
          className="mTop18"
          onChange={() => {
            handleChange({
              showall: showall !== '1' ? '1' : '0', //  rowHeight: showall === '1' ? '0' : rowHeight
            });
          }}
        >
          {_l('显示所有日程')}
        </Checkbox>
      </ShowChoose>
    </React.Fragment>
  );
}
