import React, { useState, useEffect } from 'react';
import SelectStartOrEnd from '../SelectStartOrEndControl/SelectStartOrEnd';
import { updateViewAdvancedSetting } from 'src/pages/worksheet/common/ViewConfig/util.js';
import { Checkbox } from 'ming-ui';
import Color from '../Color';
import DropDownSet from '../DropDownSet';
import NavShow from 'src/pages/worksheet/common/ViewConfig/components/navGroup/NavShow';
import { NAVSHOW_TYPE } from 'src/pages/worksheet/common/ViewConfig/components/navGroup/util';
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
import { getGunterViewType } from 'src/pages/worksheet/views/GunterView/util';
import { SYS } from 'src/pages/widgetConfig/config/widget';
import _ from 'lodash';
import { setSysWorkflowTimeControlFormat } from 'src/pages/worksheet/views/CalendarView/util.js';

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
  const { appId, view, updateCurrentView, worksheetControls = [], columns, currentSheetInfo } = props;
  const { advancedSetting = {}, viewControl = '' } = view;
  const { calendartype = '0', unweekday = '', milepost, colorid, navshow = '0', navfilters = '[]' } = advancedSetting;
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
          const { moreSort } = view;
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
              editAttrs: ['advancedSetting'],
              ...data,
            });
          } else {
            handleChange(obj);
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
      <DropDownSet
        {...props}
        handleChange={value => {
          updateCurrentView({
            ...view,
            appId,
            viewControl: value,
            advancedSetting: updateViewAdvancedSetting(view, {
              navshow: '0',
              navfilters: JSON.stringify([]),
            }),
            editAttrs: ['viewControl', 'advancedSetting'],
          });
        }}
        setDataId={viewControl}
        controlList={setSysWorkflowTimeControlFormat(
          worksheetControls.filter(
            item => _.includes([9, 11], item.type) || (item.type === 29 && item.enumDefault === 1),
          ),
          currentSheetInfo.switches || [],
        )}
        key="viewControl"
        title={_l('分组')}
        txt={_l('选择一个单选项或关联记录单条字段，记录将以选中项作为分组在显示左侧')}
        // notFoundContent={}
      />
      <NavShow
        params={{
          types: NAVSHOW_TYPE.filter(o => {
            //选项作为分组，分组没有筛选
            if ([9, 10, 11].includes((worksheetControls.find(it => it.controlId === viewControl) || {}).type)) {
              return o.value !== '3';
            } else {
              return true;
            }
          }),
          txt: _l('显示项'),
        }}
        value={navshow}
        onChange={newValue => {
          updateCurrentView({
            ...view,
            appId,
            advancedSetting: updateViewAdvancedSetting(view, { ...newValue }),
            editAttrs: ['advancedSetting'],
          });
        }}
        navfilters={navfilters}
        filterInfo={{
          allControls: worksheetControls,
          globalSheetInfo: _.pick(currentSheetInfo, [
            'appId',
            'groupId',
            'name',
            'projectId',
            'roleType',
            'worksheetId',
            'switches',
          ]),
          columns,
          viewControl,
        }}
      />
      <Color
        {...props}
        handleChange={handleChange}
        title={_l('颜色')}
        txt={_l('选择一个单选字段，时间块将按照此字段中的选项颜色来显示，用于区分记录类型')}
      />
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
