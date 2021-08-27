import React, { useState, useEffect } from 'react';
import SelectStartOrEnd from './SelectStartOrEnd';
import { updateViewAdvancedSetting } from 'src/pages/worksheet/common/ViewConfig/util.js';
import { Checkbox } from 'ming-ui';
import Color from '../Color';
import { string } from 'mathjs';
let obj = [_l('月'), _l('周'), _l('日')];
let weekObj = [_l('周一'), _l('周二'), _l('周三'), _l('周四'), _l('周五'), _l('周六'), _l('周天')];
import styled from 'styled-components';
import cx from 'classnames';
import { getAdvanceSetting } from 'src/util';
import { getCalendarViewType } from 'src/pages/worksheet/views/CalendarView/util';
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
export default function CalendarSet(props) {
  const { appId, view, updateCurrentView, worksheetControls } = props;
  const { advancedSetting = {} } = view;
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
  const { begindate = '', hour24 = '0' } = getAdvanceSetting(view);
  const startData = worksheetControls.filter(item => item.controlId === begindate);
  const isDelete = begindate && (!startData || startData.length <= 0);
  return (
    <React.Fragment>
      <div className="title Font13 bold">{_l('日期')}</div>
      <SelectStartOrEnd {...props} handleChange={handleChange} isDelete={isDelete} />
      <Color {...props} handleChange={handleChange} />
      <div className="title Font13 bold mTop32">{_l('默认视图')}</div>
      <CalendarTypeChoose>
        <ul className="calendarTypeChoose">
          {obj.map((it, i) => {
            return (
              <li
                className={cx('Hand', { current: string(i) === calendarType })}
                onClick={() => {
                  handleChange({ calendarType: string(i) });
                  window.localStorage.setItem('CalendarViewType', getCalendarViewType(string(i), startData.type));
                }}
              >
                {it}
              </li>
            );
          })}
        </ul>
      </CalendarTypeChoose>
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
      </ShowChoose>
    </React.Fragment>
  );
}
