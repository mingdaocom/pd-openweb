import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Icon, Tooltip } from 'ming-ui';
import Trigger from 'rc-trigger';
import withClickAway from 'ming-ui/decorators/withClickAway';
import createDecoratedComponent from 'ming-ui/decorators/createDecoratedComponent';
const ClickAwayable = createDecoratedComponent(withClickAway); //
import SingleFilter from 'src/pages/worksheet/common/WorkSheetFilter/common/SingleFilter';
import 'src/pages/worksheet/common/WorkSheetFilter/WorkSheetFilter.less';

const Popup = styled.div`
  background: #fff;
  width: 300px;
  border-radius: 4px;
  background-color: #fff;
  box-shadow: 0px 6px 16px rgba(0, 0, 0, 0.16);
  .addFilterCondition {
    padding: 5px 20px 20px;
  }
  .conditionItem {
    padding: 15px 20px 0;
  }
`;

export default function FilterDrop(props) {
  const { portal, setFilter } = props;
  const { controls = [], filters = [] } = portal;
  const [show, setShow] = useState(false);
  return (
    <ClickAwayable
      className="InlineBlock filterBox TxtTop"
      onClickAwayExceptions={[
        '.selectUserBox',
        '.workSheetFilter',
        '.addFilterPopup',
        '.dropdownTrigger',
        '.filterControlOptionsList',
        '.mui-dialog-container',
        '.mui-datetimepicker',
        '.mui-datetimerangepicker',
        '.worksheetFilterOperateList',
        '.ant-picker-dropdown',
        '.CityPicker',
        '.CityPicker-wrapper',
      ]}
      onClick={() => setShow(true)}
      onClickAway={() => setShow(false)}
    >
      <Trigger
        action={['click']}
        popupVisible={show}
        popup={
          <Popup className="workSheetFilter">
            <div className="filterHeader">{_l('筛选')}</div>
            <SingleFilter
              canEdit
              columns={controls.filter(o => !['avatar', 'firstLoginTime', 'roleid', 'status'].includes(o.alias))}
              filters={filters}
              onConditionsChange={conditions => {
                setFilter(conditions);
              }}
            />
          </Popup>
        }
        getPopupContainer={() => document.body}
        popupClassName="filterTrigger"
        popupAlign={{
          points: ['tr', 'br'],
          overflow: {
            adjustX: true,
            adjustY: true,
          },
        }}
      >
        <Tooltip popupPlacement="bottom" text={<span>{_l('筛选')}</span>}>
          <Icon className="mRight12 Font16 Hand actIcon InlineBlock TxtMiddle" icon="worksheet_filter" />
        </Tooltip>
      </Trigger>
    </ClickAwayable>
  );
}
