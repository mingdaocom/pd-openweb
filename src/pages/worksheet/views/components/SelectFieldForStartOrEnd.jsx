import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import { Button } from 'ming-ui/antd-components';
import SelectStartOrEnd from 'src/pages/worksheet/common/ViewConfig/components/SelectStartOrEndControl/SelectStartOrEnd';
import SelectStartOrEndGroups from 'src/pages/worksheet/common/ViewConfig/components/SelectStartOrEndControl/SelectStartOrEndGroups';
import { updateViewAdvancedSetting } from 'src/pages/worksheet/common/ViewConfig/util.js';
import { getAdvanceSetting } from 'src/utils/domain/control/advancedSetting';
import { isTimeStyle } from 'src/utils/domain/control/type';
import { isIllegal, isIllegalFormat } from 'src/utils/services/worksheet/calendar';
import { getTimeControls } from 'src/utils/services/worksheet/calendar';

export default function SelectFieldForStartOrEnd(props) {
  const {
    base,
    saveView,
    mustEnd,
    begindateOrFirst, //begindate为空时可以以第一个控件为begindate
    mustSameType, //必须同类型
    isCalendarcids, //日历视图多组时间设置
  } = props;
  const { viewId } = base;
  const [view, setView] = useState(props.view || {});
  const [isUnAb, setIsUnAb] = useState();
  let { begindate = '', enddate = '', calendarcids = '[]' } = getAdvanceSetting(view);
  let timeControls = props.timeControls || getTimeControls(props.controls);
  begindate = begindate ? begindate : begindateOrFirst ? (timeControls[0] || {}).controlId : '';
  useEffect(() => {
    setView(props.view);
  }, [props.view]);
  useEffect(() => {
    let ids;

    try {
      ids = JSON.parse(calendarcids);
    } catch (error) {
      console.log(error);
      ids = calendarcids;
      console.log(error);
    }

    let obj = isCalendarcids
      ? {
          calendarcids: ids.length <= 0 ? JSON.stringify([{ begin: begindate }]) : calendarcids,
        }
      : { begindate };
    setView({
      ...view,
      advancedSetting: updateViewAdvancedSetting(view, { ...obj }),
    });
    let end;
    let start;

    if (!isCalendarcids) {
      start = begindate
        ? props.controls.find(it => it.controlId === begindate) || {}
        : begindateOrFirst
          ? timeControls[0] || {}
          : {};
      end = enddate ? props.controls.find(it => it.controlId === enddate) || {} : {};
    } else {
      start =
        ids.length > 0 && ids[0].begin
          ? props.controls.find(it => it.controlId === ids[0].begin) || {}
          : begindateOrFirst
            ? timeControls[0] || {}
            : {};
      end = ids.length > 0 && ids[0].end ? props.controls.find(it => it.controlId === ids[0].end) || {} : {};
    }

    let listData = ids.map(o => {
      return {
        startData: props.controls.find(it => it.controlId === o.begin) || {},
        endData: props.controls.find(it => it.controlId === o.end) || {},
      };
    });
    let isErr =
      !start.controlId || //是否已选择开始时间
      (mustEnd && !end.controlId) || //是否必须有开始和结束时间
      (mustSameType && isTimeStyle(start) !== isTimeStyle(end)) || //是否必须同类型
      (isCalendarcids && isIllegalFormat(listData)) ||
      (!isCalendarcids && isIllegal(start)) ||
      isIllegal(end);
    setIsUnAb(isErr);
  }, [begindate, enddate, calendarcids, props.controls]);
  const handleChangeFn = obj => {
    let {
      begindate = begindateOrFirst ? (timeControls[0] || {}).controlId : '',
      enddate,
      calendarcids = '[]',
    } = obj.advancedSetting || {};

    try {
      calendarcids = JSON.parse(calendarcids);
    } catch (error) {
      console.log(error);
    }

    let objs = isCalendarcids
      ? {
          calendarcids:
            calendarcids.length <= 0 ? JSON.stringify([{ begin: begindate }]) : getAdvanceSetting(obj).calendarcids,
        }
      : { begindate, enddate };
    saveView(viewId, {
      advancedSetting: { ...objs },
      editAttrs: ['advancedSetting'],
      editAdKeys: Object.keys(objs),
    });
  };

  return (
    <React.Fragment>
      {isCalendarcids ? (
        <SelectStartOrEndGroups
          {...props}
          controls={props.controls}
          begindate={begindate}
          enddate={enddate}
          view={view}
          handleChange={obj => {
            setView({
              ...view,
              advancedSetting: updateViewAdvancedSetting(view, {
                ..._.omit(obj, ['begindate', 'enddate']),
              }),
            });
          }}
        />
      ) : (
        <SelectStartOrEnd
          {...props}
          view={view}
          controls={props.controls}
          begindate={begindate}
          enddate={enddate}
          beginIsDel={begindate && !props.controls.find(a => a.controlId === begindate)}
          endIsDel={enddate && !props.controls.find(a => a.controlId === enddate)}
          handleChange={obj => {
            setView({
              ...view,
              advancedSetting: updateViewAdvancedSetting(view, { ...obj }),
            });
          }}
        />
      )}
      <Button
        type="primary"
        wide
        disabled={isUnAb}
        className="mTop32"
        onClick={() => {
          if (isUnAb) {
            return;
          }

          if (begindate) {
            handleChangeFn(view);
          } else {
            alert(_l('请选择开始和结束时间'), 3);
          }
        }}
      >
        {_l('确认')}
      </Button>
    </React.Fragment>
  );
}
