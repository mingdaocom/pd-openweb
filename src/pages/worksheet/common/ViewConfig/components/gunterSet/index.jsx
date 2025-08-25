import React, { useEffect, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { Checkbox, Icon } from 'ming-ui';
import NavSet from 'src/pages/worksheet/common/ViewConfig/components/NavSet.jsx';
import TitleControl from 'src/pages/worksheet/common/ViewConfig/components/TitleControl.jsx';
import { ShowChoose } from 'src/pages/worksheet/common/ViewConfig/style.jsx';
import { SwitchStyle } from 'src/pages/worksheet/common/ViewConfig/style.jsx';
import { AnimationWrap } from 'src/pages/worksheet/common/ViewConfig/style.jsx';
import { updateViewAdvancedSetting } from 'src/pages/worksheet/common/ViewConfig/util.js';
import { formatValuesOfOriginConditions } from 'src/pages/worksheet/common/WorkSheetFilter/util';
import { getControlsForGunter } from 'src/pages/worksheet/views/GunterView/util.js';
import { getAdvanceSetting } from 'src/utils/control';
import DisplayControl from '../DisplayControl';
import DropDownSet from '../DropDownSet';
import Group from '../Group';
import SelectStartOrEnd from '../SelectStartOrEndControl/SelectStartOrEnd';

let obj = [
  { txt: _l('日'), key: '0' },
  { txt: _l('周'), key: '1' },
  { txt: _l('月'), key: '2' },
  { txt: _l('季'), key: '3' },
  { txt: _l('年'), key: '4' },
]; //calendartype：默认视图 0:月 1：周 2：日 3：季度 4：年
let weekObj = [_l('周一'), _l('周二'), _l('周三'), _l('周四'), _l('周五'), _l('周六'), _l('周天')];

export default function GunterSet(props) {
  const { appId, view, updateCurrentView, worksheetControls = [] } = props;
  const { advancedSetting = {} } = view;
  const { calendartype = '0', unweekday = '', milepost, showgroupcolor } = advancedSetting;
  let [checkedWorkDate, setCheckedWorkDate] = useState(unweekday === '');
  let [timeControls, setTimeControls] = useState(getControlsForGunter(worksheetControls));
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
    setTimeControls(getControlsForGunter(worksheetControls));
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
        className="mTop32"
        addName={'里程碑'}
        title={_l('里程碑')}
        txt={_l('选择一个检查项字段标记记录属性为里程碑')}
      />
      <TitleControl
        {...props}
        isCard={true}
        className="mTop32"
        advancedSetting={{ ..._.get(view, 'advancedSetting'), viewtitle: _.get(view, 'advancedSetting.navtitle') }}
        handleChange={value => {
          updateCurrentView({
            ...view,
            advancedSetting: { navtitle: value },
            editAttrs: ['advancedSetting'],
            editAdKeys: ['navtitle'],
          });
        }}
      />
      {/* 显示字段 */}
      <DisplayControl
        {...props}
        hideShowControlName
        worksheetControls={worksheetControls.filter(c => ![begindate, enddate].includes(c.controlId))}
        handleChangeSort={({ newControlSorts, newShowControls }) => {
          updateCurrentView(
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
      {_.get(view, 'viewControl') &&
        [9, 10, 11].includes((worksheetControls.find(o => o.controlId === _.get(view, 'viewControl')) || {}).type) && (
          <SwitchStyle className="flexRow alignItemsCenter mTop8">
            <Icon
              icon={showgroupcolor === '1' ? 'ic_toggle_on' : 'ic_toggle_off'}
              className="Font28 Hand"
              onClick={() => {
                updateCurrentView({
                  ...view,
                  appId,
                  advancedSetting: {
                    showgroupcolor: showgroupcolor === '1' ? '0' : '1',
                  },
                  editAttrs: ['advancedSetting'],
                  editAdKeys: ['showgroupcolor'],
                });
              }}
            />
            <div className="mLeft12">{_l('显示分组颜色')}</div>
          </SwitchStyle>
        )}
      {view.viewControl && (
        <NavSet
          {...props}
          navGroupId={view.viewControl}
          viewControlData={worksheetControls.find(o => o.controlId === _.get(view, 'viewControl')) || {}}
        />
      )}
      <div className="title Font13 bold mTop32">{_l('默认视图')}</div>
      <AnimationWrap className="mTop8">
        {obj.map(it => {
          return (
            <div
              className={cx('animaItem overflow_ellipsis', { active: it.key === calendartype })}
              onClick={() => {
                handleChange({ calendartype: it.key });
              }}
            >
              {it.txt}
            </div>
          );
        })}
      </AnimationWrap>
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
                  onClick={() => {
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
      </ShowChoose>
    </React.Fragment>
  );
}
