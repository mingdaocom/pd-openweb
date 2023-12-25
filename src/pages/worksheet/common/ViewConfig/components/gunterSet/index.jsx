import React, { useState, useEffect } from 'react';
import SelectStartOrEnd from '../SelectStartOrEndControl/SelectStartOrEnd';
import { updateViewAdvancedSetting } from 'src/pages/worksheet/common/ViewConfig/util.js';
import { Checkbox } from 'ming-ui';
import DropDownSet from '../DropDownSet';
let obj = [
  { txt: _l('日'), key: '0' },
  { txt: _l('周'), key: '1' },
  { txt: _l('月'), key: '2' },
  { txt: _l('季'), key: '3' },
  { txt: _l('年'), key: '4' },
]; //calendartype：默认视图 0:月 1：周 2：日 3：季度 4：年
let weekObj = [_l('周一'), _l('周二'), _l('周三'), _l('周四'), _l('周五'), _l('周六'), _l('周天')];
import styled from 'styled-components';
import cx from 'classnames';
import { getAdvanceSetting } from 'src/util';
import { SYS } from 'src/pages/widgetConfig/config/widget';
import _ from 'lodash';
import Group from '../Group';
import DisplayControl from '../DisplayControl';
import { formatValuesOfOriginConditions } from 'src/pages/worksheet/common/WorkSheetFilter/util';

const GunterTypeChoose = styled.div`
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
    border-right: 1px solid #e0e0e0;
    &:first-child {
      border-radius: 3px 0px 0px 3px;
      border-left: 1px solid #e0e0e0;
    }
    &:last-child {
      border-radius: 0 3px 3px 0;
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
export default function GunterSet(props) {
  const { appId, view, updateCurrentView, worksheetControls = [] } = props;
  const { advancedSetting = {} } = view;
  const { calendartype = '0', unweekday = '', milepost } = advancedSetting;
  let [checkedWorkDate, setCheckedWorkDate] = useState(unweekday === '');
  let [timeControls, setTimeControls] = useState(
    worksheetControls.filter(
      item =>
        !SYS.includes(item.controlId) &&
        (_.includes([15, 16], item.type) || (item.type === 38 && item.enumDefault === 2)),
    ),
  );
  const { begindate = '', enddate = '' } = getAdvanceSetting(view);
  const beginIsDel = begindate && !worksheetControls.find(item => item.controlId === begindate);
  const endIsDel = enddate && !worksheetControls.find(item => item.controlId === enddate);
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
  useEffect(() => {
    let timeControls = worksheetControls.filter(
      item =>
        !SYS.includes(item.controlId) &&
        (_.includes([15, 16], item.type) || (item.type === 38 && item.enumDefault === 2)),
    );
    setTimeControls(timeControls);
  }, [worksheetControls]);
  return (
    <React.Fragment>
      <div className="title Font13 bold">{_l('日期')}</div>
      <SelectStartOrEnd
        {...props}
        canAddTimeControl={true}
        begindate={_.get(props, ['view', 'advancedSetting', 'begindate'])}
        enddate={_.get(props, ['view', 'advancedSetting', 'enddate'])}
        handleChange={obj => {
          const { begindate } = obj;
          const { moreSort, displayControls } = view;
          const filterDate = [obj.begindate, obj.enddate].filter(n => n);
          // 第一次创建Gunter时，配置排序数据
          if (!!begindate && !moreSort) {
            let data = {};
            data = {
              sortCid: begindate,
              editAttrs: ['moreSort', 'sortCid', 'sortType', 'advancedSetting'],
              moreSort: [
                { controlId: begindate, isAsc: true },
                { controlId: 'ctime', isAsc: false },
              ],
              sortType: 2,
            };
            updateCurrentView({
              ...view,
              appId,
              advancedSetting: updateViewAdvancedSetting(view, { ...obj }),
              displayControls: displayControls.filter(n => !filterDate.includes(n)),
              editAttrs: ['advancedSetting', 'displayControls'],
              ...data,
            });
          } else {
            updateCurrentView({
              ...view,
              appId,
              advancedSetting: updateViewAdvancedSetting(view, { ...obj }),
              displayControls: displayControls.filter(n => !filterDate.includes(n)),
              editAttrs: ['advancedSetting', 'displayControls'],
            });
          }
        }}
        beginIsDel={beginIsDel}
        endIsDel={endIsDel}
        timeControls={timeControls}
        mustSameType={true}
        controls={worksheetControls}
      />
      <DropDownSet
        {...props}
        handleChange={value => {
          handleChange({ milepost: value });
        }}
        canAddControl
        addTxt={_l('添加里程碑字段')}
        controls={worksheetControls}
        setDataId={milepost}
        controlList={worksheetControls.filter(item => _.includes([36], item.type))}
        key="milepost"
        addName={'里程碑'}
        title={_l('里程碑')}
        txt={_l('选择一个检查项字段标记记录属性为里程碑')}
      />
      {/* 显示字段 */}
      <DisplayControl
        {...props}
        hideShowControlName
        worksheetControls={worksheetControls.filter(c => ![begindate, enddate].includes(c.controlId))}
        handleChangeSort={({ newControlSorts, newShowControls }) => {
          props.updateCurrentView(
            Object.assign(
              {
                appId,
                ...view,
                controlsSorts: newControlSorts,
                displayControls: newShowControls,
                editAttrs: ['displayControls', 'controlsSorts'],
              },
              {
                filters: formatValuesOfOriginConditions(view.filters),
              },
            ),
            false,
          );
        }}
      />
      <Group {...props} />
      <div className="title Font13 bold mTop32">{_l('默认视图')}</div>
      <GunterTypeChoose>
        <ul className="calendartypeChoose">
          {obj.map(it => {
            return (
              <li
                className={cx('Hand', { current: it.key === calendartype })}
                onClick={() => {
                  handleChange({ calendartype: it.key });
                }}
              >
                {it.txt}
              </li>
            );
          })}
        </ul>
      </GunterTypeChoose>
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
      </ShowChoose>
    </React.Fragment>
  );
}
