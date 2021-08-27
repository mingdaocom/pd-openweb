import React, { useState, useEffect } from 'react';
import SelectStartOrEnd from 'src/pages/worksheet/common/ViewConfig/components/calendarSet/SelectStartOrEnd.jsx';
import { updateViewAdvancedSetting } from 'src/pages/worksheet/common/ViewConfig/util.js';
import { getAdvanceSetting } from 'src/util';

import styled from 'styled-components';
import cx from 'classnames';

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
      opacity: 0.7;
    }
  }
`;

export default function SelectFieldForStartOrEnd(props) {
  const { base, controls, isDelete, saveView } = props;
  const { appId, worksheetId, viewId } = base;
  const [view, setView] = useState(props.view || {});
  let { begindate = '', enddate = '' } = getAdvanceSetting(view);
  let timeControls = controls.filter(item => item.controlId !== 'utime' && _.includes([15, 16], item.type));
  begindate = begindate ? begindate : timeControls[0].controlId;
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
  }, [begindate]);

  const handleChangeFn = obj => {
    const { begindate = timeControls[0].controlId, enddate } = obj.advancedSetting;
    saveView(viewId, {
      advancedSetting: updateViewAdvancedSetting(view, { begindate, enddate }),
      editAttrs: ['advancedSetting'],
    });
  };
  const [startData, setStartData] = useState([]);
  const [endData, setEndData] = useState([]);
  const [isDeleteN, setIsDeleteN] = useState(isDelete);
  useEffect(() => {
    setStartData(begindate ? timeControls.find((it, i) => it.controlId === begindate) : timeControls[0]);
  }, [begindate]);
  useEffect(() => {
    setIsDeleteN(begindate && (!startData || startData.length <= 0));
  }, [startData, begindate]);
  useEffect(() => {
    setEndData(timeControls.find(it => it.controlId === enddate));
  }, [enddate]);
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
          isUnAb: isDeleteN,
        })}
        onClick={() => {
          if (isDeleteN) {
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
