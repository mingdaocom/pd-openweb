import React, { useState, useEffect } from 'react';
import SelectStartOrEndGroups from '../SelectStartOrEndControl/SelectStartOrEndGroups';
import { updateViewAdvancedSetting } from 'src/pages/worksheet/common/ViewConfig/util.js';
import { Checkbox, Icon } from 'ming-ui';
import { Select } from 'antd';
import Color from '../Color';
let obj = [_l('月'), _l('周'), _l('日')];
let weekObj = [_l('周一'), _l('周二'), _l('周三'), _l('周四'), _l('周五'), _l('周六'), _l('周日')];
import styled from 'styled-components';
import cx from 'classnames';
import { getAdvanceSetting } from 'src/util';
import { getCalendarViewType, getTimeControls, getCalendartypeData } from 'src/pages/worksheet/views/CalendarView/util';
import { isTimeStyle } from 'src/pages/worksheet/views/CalendarView/util';
import _ from 'lodash';

const CalendarTypeChoose = styled.div`
  ul > li {
    margin-top: 10px;
    display: inline-block;
    width: 61px;
    height: 32px;
    text-align: center;
    line-height: 32px;
    border-top: 1px solid #e0e0e0;
    border-bottom: 1px solid #e0e0e0;
    overflow: hidden;
    vertical-align: top;
    &:first-child {
      border-radius: 3px 0px 0px 3px;
      border: 1px solid #e0e0e0;
    }
    &:last-child {
      border-radius: 0 3px 3px 0;
      border: 1px solid #e0e0e0;
    }
    &.current {
      background: #2196f3;
      color: #fff;
      border: #2196f3;
    }
  }
`;
const ShowChoose = styled.div`
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
const TimeDropdownChoose = styled.div`
  margin-top: 6px;
  .timeDropdown {
    width: 100%;
    .ant-select-selector {
      border-radius: 3px;
      line-height: 36px;
      height: 36px !important;
      span {
        line-height: 36px;
        height: 36px;
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
  } = advancedSetting;
  let [checkedWorkDate, setCheckedWorkDate] = useState(unweekday === '');

  useEffect(() => {
    setCheckedWorkDate(unweekday !== '');
  }, [unweekday]);
  const handleChange = obj => {
    updateCurrentView({
      ...view,
      appId,
      advancedSetting: updateViewAdvancedSetting(view, { ...obj }),
      editAttrs: ['advancedSetting'],
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
              advancedSetting: updateViewAdvancedSetting(view, { ...obj }),
              editAttrs: ['advancedSetting'],
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
      <Color
        {...props}
        handleChange={handleChange}
        title={_l('日程颜色')}
        txt={_l('选择一个单选项字段，数据将按照此字段中的选项颜色来标记日程颜色，用于区分日程类型')}
      />
      <div className="title Font13 bold mTop32">{_l('默认视图')}</div>
      <CalendarTypeChoose>
        <ul className="calendarTypeChoose">
          {obj.map((it, i) => {
            return (
              <li
                className={cx('Hand', { current: String(i) === calendarType })}
                onClick={() => {
                  handleChange({ calendarType: String(i) });
                  let type = getCalendarViewType(String(i), startData);
                  let data = getCalendartypeData();
                  data[`${worksheetId}-${viewId}`] = type;
                  safeLocalStorageSetItem('CalendarViewType', JSON.stringify(data));
                }}
              >
                {it}
              </li>
            );
          })}
        </ul>
      </CalendarTypeChoose>
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
                <Select.Option value={item.value + ''} key={i} label={item.text}>
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
          <div className="hiddenDaysBox mTop18">
            {weekObj.map((it, i) => {
              let n = i + 1;
              return (
                <li
                  className={cx({ checked: unweekday.indexOf(n) < 0 })}
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
                </li>
              );
            })}
          </div>
        )}
        <Checkbox
          checked={unlunar !== '1'}
          className="mTop18"
          onClick={() => {
            handleChange({ unlunar: unlunar !== '1' ? '1' : '0' });
          }}
          text={_l('显示农历')}
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
            handleChange({ showall: showall !== '1' ? '1' : '0' });
          }}
          text={_l('显示所有日程')}
        />
      </ShowChoose>
    </React.Fragment>
  );
}
