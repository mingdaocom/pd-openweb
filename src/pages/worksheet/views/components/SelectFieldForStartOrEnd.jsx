import React, { useState, useEffect } from 'react';
import SelectStartOrEnd from 'src/pages/worksheet/common/ViewConfig/components/SelectStartOrEndControl/SelectStartOrEnd';
import { updateViewAdvancedSetting } from 'src/pages/worksheet/common/ViewConfig/util.js';
import { getAdvanceSetting } from 'src/util';
import { getTimeControls } from '../CalendarView/util';
import styled from 'styled-components';
import cx from 'classnames';
import { isTimeStyle } from 'src/pages/worksheet/views/CalendarView/util';
const BtnForSure = styled.div`
   {
    padding: 0 32px;
    line-height: 36px;
    height: 36px;
    color: #fff;
    background-color: #2196f3;
    border-radius: 4px;
    outline: none;
    cursor: pointer;
    border: 1px solid transparent;
    margin-top: 32px;
    box-sizing: border-box;
    display: inline-block;
    &.isUnAb {
      background-color: #8fcaf9;
    }
  }
`;

export default function SelectFieldForStartOrEnd(props) {
  const {
    base,
    controls,
    saveView,
    mustEnd,
    begindateOrFirst, //begindate为空时可以以第一个控件为begindate
    mustSameType, //必须同类型
  } = props;
  const { appId, worksheetId, viewId } = base;
  const [view, setView] = useState(props.view || {});
  const [isUnAb, setIsUnAb] = useState();
  let { begindate = '', enddate = '' } = getAdvanceSetting(view);
  let timeControls = props.timeControls || getTimeControls(controls);
  begindate = begindate ? begindate : begindateOrFirst ? (timeControls[0] || {}).controlId : '';
  useEffect(() => {
    setView(props.view);
  }, [props.view]);
  useEffect(() => {
    setView(
      {
        ...view,
        advancedSetting: updateViewAdvancedSetting(view, { begindate }),
      },
      begindate,
    );
    let start = begindate
      ? timeControls.find(it => it.controlId === begindate) || {}
      : begindateOrFirst
      ? timeControls[0] || {}
      : {};
    let end = enddate ? timeControls.find((it, i) => it.controlId === enddate) || {} : {};
    let isErr =
      !start.controlId || //是否已选择开始时间
      (mustEnd && !end.controlId) || //是否必须有开始和结束时间
      (mustSameType && isTimeStyle(start) !== isTimeStyle(end)); //是否必须同类型
    setIsUnAb(isErr);
  }, [begindate, enddate]);
  const handleChangeFn = obj => {
    const { begindate = begindateOrFirst ? (timeControls[0] || {}).controlId : '', enddate } = obj.advancedSetting;
    saveView(viewId, {
      advancedSetting: updateViewAdvancedSetting(view, { begindate, enddate }),
      editAttrs: ['advancedSetting'],
    });
  };
  return (
    <React.Fragment>
      <SelectStartOrEnd
        {...props}
        worksheetControls={controls}
        view={view}
        handleChange={obj => {
          setView({
            ...view,
            advancedSetting: updateViewAdvancedSetting(view, { ...obj }),
          });
        }}
      />
      <BtnForSure
        className={cx({
          isUnAb: isUnAb,
        })}
        onClick={() => {
          if (isUnAb) {
            return;
          }
          if (begindate) {
            handleChangeFn(view);
          } else {
            alert(_l('请选择开始和结束时间'));
          }
        }}
      >
        {_l('确认')}
      </BtnForSure>
    </React.Fragment>
  );
}
