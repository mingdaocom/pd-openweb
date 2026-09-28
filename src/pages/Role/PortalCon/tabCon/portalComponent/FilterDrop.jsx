import React, { useState } from 'react';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { Popover, Tooltip } from 'ming-ui/antd-components';
import ClickAway from 'ming-ui/components/ClickAway';
import SingleFilter from 'src/pages/worksheet/common/WorkSheetFilter/common/SingleFilter';
import 'src/pages/worksheet/common/WorkSheetFilter/WorkSheetFilter.less';

const ClickAwayable = ClickAway;

const Popup = styled.div`
  width: 300px;
  .filterHeader {
    border-bottom: 1px solid var(--color-border-secondary);
    padding-left: 20px;
    line-height: 44px;
    font-size: 16px;
    color: var(--color-text-title);
  }
  > .singleFilter.workSheetFilter {
    width: auto;
    border-radius: 0;
    background: transparent;
    box-shadow: none;
  }
  .addFilterCondition {
    padding: 5px 20px 20px;
  }
  .conditionItem {
    padding: 15px 20px 0;
  }
`;

export default function FilterDrop(props) {
  const { portal, setFilter, appId } = props;
  const { controls = [], filters = [] } = portal;
  const [show, setShow] = useState(false);
  return (
    <ClickAwayable
      className="InlineBlock filterBox TxtTop"
      onClickAwayExceptions={[
        '.selectUserBox',
        '.portalFilterPopup',
        '.addFilterPopup',
        '.filterControlOptionsList',
        '.hap-modal-wrap',
        '.worksheetFilterOperateList',
        '.hap-picker-dropdown',
        '.CityPicker',
        '.CityPicker-wrapper',
        '.hap-modal-wrap',
      ]}
      onClick={() => setShow(true)}
      onClickAway={() => setShow(false)}
    >
      <Tooltip placement="bottom" title={_l('筛选')}>
        <Popover
          noPadding
          trigger="click"
          open={show}
          content={
            <Popup className="portalFilterPopup">
              <div className="filterHeader">{_l('筛选')}</div>
              <SingleFilter
                canEdit
                columns={controls.filter(o => !['avatar', 'firstLoginTime', 'roleid', 'status'].includes(o.alias))}
                filters={filters}
                onConditionsChange={conditions => {
                  setFilter(conditions);
                  setShow(true);
                }}
                appId={appId}
              />
            </Popup>
          }
          getPopupContainer={() => document.body}
          placement="bottomRight"
        >
          <Icon className="mRight12 Font16 Hand actIcon InlineBlock TxtMiddle" icon="worksheet_filter" />
        </Popover>
      </Tooltip>
    </ClickAwayable>
  );
}
