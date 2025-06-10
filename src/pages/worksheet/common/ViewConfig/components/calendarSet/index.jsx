import React, { useEffect, useState } from 'react';
import { useSetState } from 'react-use';
import { Select } from 'antd';
import { TimePicker } from 'antd';
import localeEn from 'antd/es/date-picker/locale/en_US';
import localeJaJp from 'antd/es/date-picker/locale/ja_JP';
import localeZhCn from 'antd/es/date-picker/locale/zh_CN';
import localeZhTw from 'antd/es/date-picker/locale/zh_TW';
import cx from 'classnames';
import dayjs from 'dayjs';
import _ from 'lodash';
import styled from 'styled-components';
import { Checkbox, Icon } from 'ming-ui';
import { TimeDropdownChoose } from 'src/pages/worksheet/common/ViewConfig/style.jsx';
import { AnimationWrap } from 'src/pages/worksheet/common/ViewConfig/style.jsx';
import { getCalendartypeData, getCalendarViewType, getTimeControls } from 'src/pages/worksheet/views/CalendarView/util';
import { isTimeStyle } from 'src/pages/worksheet/views/CalendarView/util';
import { getAdvanceSetting } from 'src/utils/control';
import SelectStartOrEndGroups from '../SelectStartOrEndControl/SelectStartOrEndGroups';

let obj = [_l('月'), _l('周'), _l('日')];
let weekObj = [_l('周一'), _l('周二'), _l('周三'), _l('周四'), _l('周五'), _l('周六'), _l('周日')];
const locales = { 'zh-Hans': localeZhCn, 'zh-Hant': localeZhTw, en: localeEn, ja: localeJaJp };
const locale = locales[md.global.Account.lang];

const ShowChoose = styled.div`
  .showtimeCon {
    border: 1px solid #ddd;
    border-radius: 3px;
    color: #757575;
    padding: 6px 12px;
    background: #fff;
    display: flex;
    justify-content: space-between;
    cursor: pointer;
    &:hover {
      background: #f5f5f5;
    }
  }
  .hiddenDaysBox {
    margin-left: 26px;
    display: flex;
    li {
      flex: 1;
      height: 36px;
      display: inline-block;
      box-sizing: border-box;
      text-align: center;
      cursor: pointer;
      line-height: 36px;
      border: 1px solid #e0e0e0;
      overflow: hidden;
      margin-right: -1px;
      position: relative;
      &:last-child {
        border-radius: 0 3px 3px 0;
        overflow: hidden;
      }
      &:first-child {
        border-radius: 3px 0px 0px 3px;
        overflow: hidden;
      }
      &.checked {
        background: #2196f3;
        color: #fff;
        border-top: 1px solid #2196f3;
        border-bottom: 1px solid #2196f3;
        z-index: 1;
        &:last-child {
          border-right: 1px solid #2196f3;
        }
        &:first-child {
          border-left: 1px solid #2196f3;
        }
      }
    }
  }
`;

export default function CalendarSet(props) {
  const { appId, view, updateCurrentView, worksheetControls } = props;
  const { advancedSetting = {}, worksheetId, viewId } = view;
  const {
    calendarType = '0',
    unlunar, //默认显示农历
    unweekday = '',
    rowHeight = '0',
  } = advancedSetting;
  let [checkedWorkDate, setCheckedWorkDate] = useState(unweekday === '');
  const [{ show }, setState] = useSetState({
    show: false,
  });
  useEffect(() => {
    changePickerContainerLeft();
  }, []);

  const changePickerContainerLeft = () => {
    const changeLeft = () => {
      $('.ant-picker-range-arrow').css({ transition: 'none' });
      $('.ant-picker-panel-container').css({
        marginLeft: parseInt($('.ant-picker-range-arrow').css('left')),
      });
    };
    setTimeout(() => {
      $('.ant-picker-input input').on({
        click: () => changeLeft(),
        focus: () => changeLeft(),
      });
    }, 500);
  };

  useEffect(() => {
    setCheckedWorkDate(unweekday !== '');
  }, [unweekday]);
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
    calendarcids = JSON.parse(_.get(view, ['advancedSetting', 'calendarcids']));
  } catch (error) {
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

  const startData = worksheetControls.filter(item => item.controlId === calendarcids[0].begin);
  const isDelete = calendarcids[0].begin && (!startData || startData.length <= 0);
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
          <AnimationWrap className="mTop8">
            {obj.map((it, i) => {
              return (
                <div
                  className={cx('animaItem overflow_ellipsis', { active: String(i) === calendarType })}
                  style={{ padding: '0 18px' }}
                  onClick={() => {
                    handleChange({ calendarType: String(i) });
                    let type = getCalendarViewType(String(i), startData);
                    let data = getCalendartypeData();
                    data[`${worksheetId}-${viewId}`] = type;
                    safeLocalStorageSetItem('CalendarViewType', JSON.stringify(data));
                  }}
                >
                  {it}
                </div>
              );
            })}
          </AnimationWrap>
        </div>
        <div className="mLeft24">
          <div className="title Font13 bold mTop32">{_l('月视图高度')}</div>
          <AnimationWrap className="mTop8">
            {[_l('紧凑'), _l('宽松')].map((it, i) => {
              return (
                <li
                  className={cx('animaItem overflow_ellipsis pLeft18 pRight18', { active: String(i) === rowHeight })}
                  style={{ padding: '0 18px' }}
                  onClick={() => {
                    handleChange({ rowHeight: String(i), showall: '1' });
                    // let type = getCalendarViewType(String(i), startData);
                    // let data = getCalendartypeData();
                    // data[`${worksheetId}-${viewId}`] = type;
                    // safeLocalStorageSetItem('CalendarViewType', JSON.stringify(data));
                  }}
                >
                  {it}
                </li>
              );
            })}
          </AnimationWrap>
        </div>
      </div>

      <div className="title Font13 bold mTop32">{_l('每周的第一天')}</div>
      <TimeDropdownChoose>
        <Select
          className={cx('timeDropdown', {})}
          value={[weekbegin]}
          optionLabelProp="label"
          placeholder={_l('请选择')}
          suffixIcon={<Icon icon="arrow-down-border Font14" />}
          dropdownClassName="dropConOption"
          onChange={value => {
            if (value === weekbegin) {
              return;
            }
            handleChange({ weekbegin: String(value) });
          }}
          notFoundContent={_l('当前工作表中没有单选字段，请先去添加一个')}
        >
          {weekObj
            .map((o, i) => {
              return {
                text: o,
                value: i + 1,
              };
            })
            // .filter(o => unweekday.indexOf(o.value) < 0)
            .map((item, i) => {
              return (
                <Select.Option value={item.value + ''} key={i} label={item.text} className="select_drop">
                  {item.text}
                </Select.Option>
              );
            })}
        </Select>
      </TimeDropdownChoose>
      <div className="title Font13 bold mTop32">{_l('设置')}</div>
      <ShowChoose>
        <Checkbox
          checked={checkedWorkDate}
          className="mTop18"
          onClick={e => {
            if (!checkedWorkDate) {
              handleChange({ unweekday: '67' });
            } else {
              handleChange({ unweekday: '' });
            }
            setCheckedWorkDate(e);
          }}
          text={_l('只显示工作日')}
        />
        {checkedWorkDate && (
          <AnimationWrap className="hiddenDaysBox mTop18">
            {weekObj.map((it, i) => {
              let n = i + 1;
              return (
                <div
                  className={cx('animaItem overflow_ellipsis', { active: unweekday.indexOf(n) < 0 })}
                  onClick={e => {
                    let str = unweekday;
                    if (unweekday.indexOf(n) >= 0) {
                      str = str.replace(n, '');
                    } else {
                      str = `${str}` + n;
                    }
                    if (str.length >= 7) {
                      //不能全部选中
                      return;
                    }
                    handleChange({ unweekday: str });
                  }}
                >
                  {it}
                </div>
              );
            })}
          </AnimationWrap>
        )}
        <Checkbox
          checked={!!_.get(props, 'view.advancedSetting.showtime')}
          className="mTop16"
          onClick={e => {
            // if (!_.get(props, 'view.advancedSetting.showtime')) {
            //   return setState({ show: true });
            // }
            updateCurrentView({
              ...view,
              appId,
              advancedSetting: { showtime: !_.get(props, 'view.advancedSetting.showtime') ? '08:00-18:00' : undefined },
              editAdKeys: ['showtime'],
              editAttrs: ['advancedSetting'],
            });
            !_.get(props, 'view.advancedSetting.showtime') && changePickerContainerLeft();
          }}
          text={_l('只显示工作时间')}
        />
        {!!_.get(props, 'view.advancedSetting.showtime') && (
          <div className="flexRow timeCon alignItemsCenter mTop8">
            <TimePicker.RangePicker
              className={cx('rangePicker w100 borderAll3 flex')}
              format="HH:mm"
              value={
                _.get(props, 'view.advancedSetting.showtime')
                  ? _.get(props, 'view.advancedSetting.showtime')
                      .split('-')
                      .map(item => dayjs(item, 'HH:mm'))
                  : []
              }
              hourStep={1}
              minuteStep={60}
              popupClassName={`filterDateRangeInputPopup`}
              onClick={() => {
                const $arrow = $(`.filterDateRangeInputPopup .ant-picker-range-arrow`);
                if ($arrow) {
                  setTimeout(() => {
                    const $arrows = $(`.filterDateRangeInputPopup .ant-picker-range-arrow`);
                    const arrowLeft = $arrows.css('left');
                    $(`.filterDateRangeInputPopup .ant-picker-panel-container`).css({
                      marginLeft: arrowLeft,
                    });
                  }, 200);
                }
              }}
              onChange={(data, timeString) => {
                if (data && data[0] && data[1] && dayjs(data[1]).diff(dayjs(data[0])) <= 0) {
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
              locale={locale}
              showNow={true}
              allowClear={false}
            />
          </div>
        )}
        <Checkbox
          checked={unlunar === '0'} //默认不勾选“显示中国农历”功能
          className="mTop18"
          onClick={() => {
            handleChange({ unlunar: unlunar === '0' ? '1' : '0' });
          }}
          text={_l('显示中国农历')}
        />
        <Checkbox
          checked={hour24 === '1'}
          className="mTop18"
          onClick={() => {
            handleChange({ hour24: hour24 !== '1' ? '1' : '0' });
          }}
          text={_l('24小时制')}
        />
        <Checkbox
          checked={showall === '1'}
          className="mTop18"
          onClick={() => {
            handleChange({
              showall: showall !== '1' ? '1' : '0',
              //  rowHeight: showall === '1' ? '0' : rowHeight
            });
          }}
          text={_l('显示所有日程')}
        />
      </ShowChoose>
    </React.Fragment>
  );
}
